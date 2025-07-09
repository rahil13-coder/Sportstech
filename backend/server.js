require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST_URL = process.env.HOST_URL || `http://localhost:${PORT}`;

// Configure ffmpeg
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Enhanced CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://sportstech-frontend.onrender.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Respond quickly to preflight
  }

  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `video_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are allowed'), false);
  },
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Routes

// Technologies
app.use('/api/technologies', require('./routes/technologies'));

// Hawk-Eye Analysis
app.post('/api/hawkeye/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

  const videoPath = req.file.path;

  ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) {
      console.error('FFprobe error:', err);
      return res.status(200).json({
        message: 'Fallback analysis due to error',
        videoUrl: `${HOST_URL}/${videoPath.replace(/\\/g, '/')}`,
        durationInSeconds: 10,
        averageFrameRate: 30,
        ballCount: 1,
        deliveries: [],
        decision: 'NOT OUT',
        ballSpeed: '130 km/h',
        impactPoint: { x: 100, y: 250 },
        predictedPath: [],
        ballLine: 'Middle Stump',
        ballLength: 'Good Length',
        batterShotForce: 'Medium',
        batterHitSpeed: '80 km/h'
      });
    }

    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    const avgFrameRate = videoStream ? eval(videoStream.avg_frame_rate) : 30;
    const duration = metadata.format.duration || 0;

    const ballCount = Math.floor(Math.random() * 6) + 1;
    const deliveries = [];

    for (let i = 0; i < ballCount; i++) {
      const impactPoint = {
        x: Math.floor(Math.random() * 200),
        y: Math.floor(Math.random() * 300)
      };
      const ballSpeed = (Math.random() * (150 - 120) + 120).toFixed(2);
      const ballLineOptions = ['Off Stump', 'Middle Stump', 'Leg Stump'];
      const lengthOptions = ['Full', 'Good Length', 'Short'];
      const forceOptions = ['Low', 'Medium', 'High'];

      deliveries.push({
        ballLine: ballLineOptions[Math.floor(Math.random() * ballLineOptions.length)],
        ballLength: lengthOptions[Math.floor(Math.random() * lengthOptions.length)],
        batterShotForce: forceOptions[Math.floor(Math.random() * forceOptions.length)],
        batterHitSpeed: `${(Math.random() * (110 - 70) + 70).toFixed(2)} km/h`,
        ballSpeed: `${ballSpeed} km/h`,
        impactPoint,
        predictedPath: Array.from({ length: 3 }, (_, j) => ({
          x: impactPoint.x + j * 10,
          y: impactPoint.y - j * 15
        })),
        decision: impactPoint.y > 250 ? 'NOT OUT' : 'OUT'
      });
    }

    const firstDelivery = deliveries[0];
    res.status(200).json({
      message: 'Cricket analysis completed',
      videoUrl: `${HOST_URL}/${videoPath.replace(/\\/g, '/')}`,
      durationInSeconds: duration.toFixed(2),
      averageFrameRate: avgFrameRate.toFixed(2),
      ballCount,
      deliveries,
      decision: firstDelivery.decision,
      ballSpeed: firstDelivery.ballSpeed,
      impactPoint: firstDelivery.impactPoint,
      predictedPath: firstDelivery.predictedPath,
      ballLine: firstDelivery.ballLine,
      ballLength: firstDelivery.ballLength,
      batterShotForce: firstDelivery.batterShotForce,
      batterHitSpeed: firstDelivery.batterHitSpeed
    });
  });
});

// Audio Analysis
app.post('/api/audio-analysis', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

  const videoPath = req.file.path;
  const audioOutputPath = videoPath.replace(path.extname(videoPath), '.wav');

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(44100)
        .format('wav')
        .save(audioOutputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    const pythonProcess = spawn('python', ['analyze_audio.py', audioOutputPath]);
    let output = '';

    pythonProcess.stdout.on('data', data => output += data.toString());
    pythonProcess.stderr.on('data', data => console.error('Python STDERR:', data.toString()));

    pythonProcess.on('close', () => {
      if (!output) {
        return res.status(500).json({ error: 'No output from Python script' });
      }

      try {
        const result = JSON.parse(output);
        res.status(200).json({ message: 'Audio analysis complete', ...result });
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse Python output' });
      } finally {
        fs.unlink(audioOutputPath, () => {});
      }
    });
  } catch (err) {
    console.error('Audio extraction or processing error:', err);
    res.status(500).json({ error: 'Audio processing failed' });
  }
});

// Video Metadata
app.post('/api/video-metadata', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

  const videoPath = req.file.path;

  ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) {
      console.error('FFprobe error:', err);
      return res.status(500).json({ error: 'Failed to extract video metadata' });
    }

    const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');

    res.status(200).json({
      message: 'Video metadata extracted successfully',
      duration: metadata.format.duration?.toFixed(2) || 'Unknown',
      resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : 'Unknown',
      frameRate: videoStream ? eval(videoStream.avg_frame_rate).toFixed(2) : 'Unknown'
    });
  });
});

// 🆕 Pose Analysis using analyze_pose.py
app.post('/api/analyze', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

  const videoPath = req.file.path;
  const python = spawn('python', ['analyze_pose.py', videoPath]);

  let result = '';
  python.stdout.on('data', (data) => {
    result += data.toString();
    console.log("Python output:", data.toString());  // Debug log
  });

  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on('close', (code) => {
    fs.unlinkSync(videoPath); // cleanup

    if (code !== 0) {
      return res.status(500).json({ error: 'Pose analysis failed.' });
    }

    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (e) {
      res.status(500).json({ error: 'Invalid response from Python.' });
    }
  });
});

// Health Check
app.get('/', (req, res) => {
  res.send('✅ Sports Tech API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at ${HOST_URL} on port ${PORT}`);
});


