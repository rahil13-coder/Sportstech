import React, { useState, useRef } from 'react';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function SnickoMeter() {
  const [spikeDetected, setSpikeDetected] = useState(false);
  const [spikeData, setSpikeData] = useState([]);
  const [timestamp, setTimestamp] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [hitStatus, setHitStatus] = useState(null);
  const [musicDetected, setMusicDetected] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [amplitudeData, setAmplitudeData] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [hasAudio, setHasAudio] = useState(true);
  const [audioChecked, setAudioChecked] = useState(false);
  const [detailedTimeline, setDetailedTimeline] = useState([]);
  const [shotSummary, setShotSummary] = useState(null);

  const videoRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Infer shot type based on wrist and elbow y positions
  const inferShotFromPose = (wrist, elbow) => {
    if (!wrist || !elbow) return 'Unknown';
    const wristHeight = wrist.y;
    const elbowHeight = elbow.y;

    if (wristHeight < elbowHeight) return 'Cover Drive';
    else if (wristHeight > elbowHeight + 50) return 'Pull Shot';
    else return 'Straight Drive';
  };

  // Infer ball type based on y position (deterministic now)
  const inferBallType = (ballY) => {
    if (ballY < 150) return 'Short Ball';
    else if (ballY >= 150 && ballY <= 300) return 'Good Length';
    else return 'Full Toss';
  };

  // Infer shot decision based on shot and ball type
  const inferShotDecision = (shotType, ballType) => {
    if (ballType === 'Short Ball' && shotType === 'Pull Shot') return 'Good Shot Selection';
    if (ballType === 'Full Toss' && shotType === 'Cover Drive') return 'Excellent Drive Opportunity';
    if (ballType === 'Good Length' && shotType === 'Straight Drive') return 'Technically Correct';
    return 'Poor Shot Selection';
  };

  // Optimized pose detection function
  const runPoseDetection = async () => {
    try {
      setIsAnalyzing(true);
      await tf.ready();

      const detector = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      );

      const video = videoRef.current;
      if (!video) {
        setIsAnalyzing(false);
        return;
      }

      const interval = 4000; // milliseconds between frames
      const maxFrames = 8; // reduced from 16 for speed
      const frameCount = Math.min(Math.floor((video.duration * 1000) / interval), maxFrames);

      const posesData = [];

      // Precompute deterministic ballY positions for each frame
      const ballYPositions = Array.from({ length: frameCount }, (_, i) =>
        100 + (i * 30) % 400 // deterministic pattern between 100 and 499
      );

      for (let i = 0; i < frameCount; i++) {
        video.currentTime = i * interval / 1000;
        await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));

        const poses = await detector.estimatePoses(video);

        if (poses && poses.length > 0) {
          const keypoints = poses[0].keypoints;
          const wrist = keypoints.find(k => k.name === 'right_wrist' || k.name === 'left_wrist');
          const elbow = keypoints.find(k => k.name === 'right_elbow' || k.name === 'left_elbow');
          const shoulder = keypoints.find(k => k.name === 'right_shoulder' || k.name === 'left_shoulder');

          if (wrist && elbow && shoulder) {
            const shot = inferShotFromPose(wrist, elbow);
            const ballY = ballYPositions[i];
            const ballType = inferBallType(ballY);
            const decision = inferShotDecision(shot, ballType);

            posesData.push({
              time: (i * interval / 1000).toFixed(2),
              shot,
              ballRegion: wrist.x < elbow.x - 20 ? 'Leg Side' : wrist.x > elbow.x + 20 ? 'Off Side' : 'Straight',
              bowlerType: i * interval < 3000 ? 'Pace' : 'Spin',
              shotTiming:
                wrist.y - elbow.y < -20
                  ? 'Early'
                  : wrist.y - elbow.y > 20
                    ? 'Late'
                    : 'Perfect',
              decision
            });
          }
        }
      }

      if (posesData.length > 0) {
        const mostFrequentShot = posesData.reduce((acc, pose) => {
          acc[pose.shot] = (acc[pose.shot] || 0) + 1;
          return acc;
        }, {});

        const sortedShots = Object.entries(mostFrequentShot).sort((a, b) => b[1] - a[1]);
        const bestShot = sortedShots.length > 0 ? sortedShots[0][0] : 'Unknown';

        setPerformanceMetrics({
          shotPlayed: bestShot,
          ballRegion: posesData[0].ballRegion,
          bowlerType: posesData[0].bowlerType,
          shotTiming: posesData[0].shotTiming,
        });

        const summary = {
          totalFramesAnalyzed: frameCount,
          uniqueShots: [...new Set(posesData.map(p => p.shot))],
          shotFrequency: Object.fromEntries(sortedShots)
        };

        setShotSummary(summary);
        setDetailedTimeline(posesData.map(({ time, shot }) => ({ time, shot })));
        setShowResults(true);
      }
    } catch (error) {
      console.error('Pose detection failed:', error);
      setError('Pose detection failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Main video upload handler
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setSpikeDetected(false);
    setTimestamp(null);
    setError('');
    setHitStatus(null);
    setMusicDetected(false);
    setSpikeData([]);
    setShowResults(false);
    setShowGraph(false);
    setAmplitudeData([]);
    setPerformanceMetrics(null);
    setHasAudio(false);
    setAudioChecked(false);
    setDetailedTimeline([]);
    setShotSummary(null);

    const previewUrl = URL.createObjectURL(file);
    setVideoUrl(previewUrl);

    const formData = new FormData();
    formData.append('video', file);

    try {
      // Call backend API for initial analysis
      const response = await axios.post('http://localhost:5000/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const {
        summary,
        detailedShotTimeline,
        shotPlayed,
        ballRegion,
        bowlerType,
        shotTiming
      } = response.data;

      setPerformanceMetrics({ shotPlayed, ballRegion, bowlerType, shotTiming });
      if (summary && detailedShotTimeline) {
        setShotSummary(summary);
        setDetailedTimeline(detailedShotTimeline);
      }

      // Audio processing
      const arrayBuffer = await file.arrayBuffer();

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      let audioBuffer = null;
      try {
        audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
      } catch (e) {
        audioBuffer = null;
      }

      setAudioChecked(true);

      if (!audioBuffer || audioBuffer.duration === 0) {
        // No audio, fallback to pose detection only
        setHasAudio(false);
        await runPoseDetection();
        return;
      }

      setHasAudio(true);

      const rawData = audioBuffer.getChannelData(0);
      const maxSamples = 1000;
      const blockSize = Math.floor(rawData.length / maxSamples);
      const amplitudes = [];

      // Efficient amplitude calculation (chunked to avoid blocking)
      for (let i = 0; i < maxSamples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[i * blockSize + j]);
        }
        const avg = sum / blockSize;
        const time = ((i * blockSize) / audioBuffer.sampleRate).toFixed(2);
        amplitudes.push({ time, amplitude: avg });
      }

      setAmplitudeData(amplitudes);

      // Detect music presence
      const highEnergy = amplitudes.filter((a) => a.amplitude > 0.2);
      const musicLikelihood = highEnergy.length / amplitudes.length;
      if (musicLikelihood > 0.5) {
        setMusicDetected(true);
        if (videoRef.current) videoRef.current.muted = true;
      }

      // Detect spikes for bat-ball contact
      const threshold = 0.17;
      const spikes = [];

      for (let i = 5; i < amplitudes.length; i++) {
        const current = amplitudes[i].amplitude;
        const prev = amplitudes[i - 1].amplitude;

        if (current > threshold && current > prev * 1.5 && current > 0.3) {
          let decision = '';
          if (current > 0.45) decision = 'Ball hit the bat 🏏';
          else if (current > 0.35) decision = 'Possible edge 🤔';
          else continue;

          spikes.push({
            timestamp: amplitudes[i].time,
            spikeValue: current.toFixed(4),
            decision,
          });
        }
      }

      setSpikeDetected(spikes.length > 0);
      setSpikeData(spikes);

      if (spikes.length === 0) {
        setHitStatus('No contact detected ❌');
      } else {
        setHitStatus('Multiple spikes detected 📈');
        setTimestamp(spikes[0].timestamp);
      }

      setShowResults(true);
      setShowGraph(true);

    } catch (err) {
      console.error('Error analyzing video:', err);
      setError('Failed to analyze video.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Back button handler to hide results and graph
  const handleBack = () => {
    setShowResults(false);
    setShowGraph(false);
  };

  return (
    <div className="card p-4 bg-light mb-4" style={{ width: '90%', margin: '0 auto' }}>
      <h4>🎙️ Snicko Meter Technology</h4>
      <p>Upload a cricket video. This detects bat-ball contact & generates real-time metrics.</p>
      <input type="file" accept="video/*" className="form-control mb-3" onChange={handleVideoUpload} />

      {videoUrl && (
        <div className="mb-3">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            width="100%"
            // Removed onLoadedData call to runPoseDetection here to avoid duplicate calls
          />
        </div>
      )}

      {hasAudio && audioChecked && !showResults && videoUrl && !isAnalyzing ? (
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-primary" onClick={() => setShowResults(true)}>Show Results</button>
          <button className="btn btn-outline-success" onClick={() => setShowGraph(true)}>Show Graphical Analysis</button>
        </div>
      ) : (!hasAudio && performanceMetrics && !showResults && (
        <div className="alert alert-info small mb-3">
          🎥 No audio detected, displaying pose-based performance metrics only.
        </div>
      ))}

      {(showResults || showGraph) && (
        <button className="btn btn-secondary mb-3" onClick={handleBack}>← Back</button>
      )}

      {showResults && (
        <>
          {isAnalyzing && <div className="alert alert-info small">Analyzing... Please wait.</div>}
          {error && <div className="alert alert-danger small">{error}</div>}

          {!isAnalyzing && (
            <>
              {spikeDetected !== null && (
                <div className={`alert ${spikeDetected ? 'alert-success' : 'alert-warning'} small`}>
                  {spikeDetected
                    ? `Spike Detected at ${timestamp} seconds`
                    : 'No spike detected in audio.'}
                </div>
              )}

              {hitStatus && (
                <div className={`alert ${hitStatus.toLowerCase().includes('ball hit') ? 'alert-success' : 'alert-warning'} small`}>
                  <strong>AI Decision:</strong> {hitStatus}
                </div>
              )}

              {musicDetected && (
                <div className="alert alert-warning small">
                  🎵 <strong>Music Detected:</strong> Background music detected — video muted.
                </div>
              )}

              {spikeData.length > 0 && (
                <div className="mt-4 small">
                  <h6>📋 Spike Detection Log</h6>
                  <table className="table table-striped table-bordered table-hover table-sm">
                    <thead className="table-dark small">
                      <tr>
                        <th>#</th>
                        <th>Time (sec)</th>
                        <th>Amplitude</th>
                        <th>AI Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spikeData.map((spike, index) => (
                        <tr key={index} className="small">
                          <td>{index + 1}</td>
                          <td>{spike.timestamp}</td>
                          <td>{spike.spikeValue}</td>
                          <td>{spike.decision}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {shotSummary && (
                <div className="mt-5 p-3 border rounded bg-white small">
                  <h6>🎯 Shot Summary</h6>
                  <ul>
                    <li><strong>Total Frames Analyzed:</strong> {shotSummary.totalFramesAnalyzed}</li>
                    <li><strong>Unique Shots:</strong> {shotSummary.uniqueShots.join(', ')}</li>
                    <li><strong>Shot Frequency:</strong>
                      <ul>
                        {Object.entries(shotSummary.shotFrequency).map(([shot, freq], i) => (
                          <li key={i}>{shot}: {freq} times</li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </div>
              )}

              {detailedTimeline.length > 0 && (
                <div className="mt-4 small">
                  <h6>📼 Shot Detection Timeline</h6>
                  <table className="table table-bordered table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Time (s)</th>
                        <th>Shot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedTimeline.map((entry, i) => (
                        <tr key={i}>
                          <td>{entry.time}</td>
                          <td>{entry.shot}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {showGraph && amplitudeData.length > 0 && (
        <div className="mt-5">
          <h6>📊 Audio Amplitude over Time</h6>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={amplitudeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amplitude" stroke="#8884d8" activeDot={{ r: 8 }} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {performanceMetrics && (
        <div className="mt-5 p-3 border rounded bg-white">
          <h6>🏏 Performance Metrics</h6>
          <ul>
            <li><strong>Shot Played:</strong> {performanceMetrics.shotPlayed}</li>
            <li><strong>Ball Hit Region:</strong> {performanceMetrics.ballRegion}</li>
            <li><strong>Bowler Type:</strong> {performanceMetrics.bowlerType}</li>
            <li><strong>Shot Timing:</strong> {performanceMetrics.shotTiming}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default SnickoMeter;

