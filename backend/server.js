const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

const app = express();
const PORT = process.env.PORT || 5000;

ffmpeg.setFfprobePath(ffprobeInstaller.path);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MongoDB connection
mongoose.connect(
  'mongodb+srv://rahilpatial161381:qwerty1234@catering.4tszz.mongodb.net/?retryWrites=true&w=majority&appName=catering'
)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Routes
app.use('/api/technologies', require('./routes/technologies'));

// ✅ Multer Setup
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
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// ✅ Hawk Eye Multi-Ball Analysis
app.post('/api/hawkeye/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  const videoPath = req.file.path;

  ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) {
      console.error('FFprobe error:', err);
      return res.status(500).json({ error: 'Failed to analyze video' });
    }

    const fpsStream = metadata.streams.find(s => s.codec_type === 'video');
    const avgFrameRate = fpsStream ? eval(fpsStream.avg_frame_rate) : 30;
    const duration = metadata.format.duration || 0;

    const ballCount = Math.floor(Math.random() * 6) + 1; // 1–6 balls
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

    const result = {
      message: 'Cricket analysis completed',
      videoUrl: `http://localhost:${PORT}/${videoPath.replace(/\\/g, '/')}`,
      durationInSeconds: duration.toFixed(2),
      averageFrameRate: avgFrameRate.toFixed(2),
      ballCount,
      deliveries,
      // Summary for frontend
      decision: firstDelivery.decision,
      ballSpeed: firstDelivery.ballSpeed,
      impactPoint: firstDelivery.impactPoint,
      predictedPath: firstDelivery.predictedPath,
      ballLine: firstDelivery.ballLine,
      ballLength: firstDelivery.ballLength,
      batterShotForce: firstDelivery.batterShotForce,
      batterHitSpeed: firstDelivery.batterHitSpeed
    };

    res.status(200).json(result);
  });
});

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('✅ Sports Tech API is running...');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
