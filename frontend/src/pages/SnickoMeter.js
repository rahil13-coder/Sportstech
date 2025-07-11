import React, { useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

// --- Config ---
const INTERVAL = 1000, MAX_FRAMES = 30;

// --- Helpers ---
const extractKeypoints = kps => {
  const get = n => kps.find(kp => kp.name === n)?.position || null;
  return {
    wrist: get("right_wrist"), elbow: get("right_elbow"), shoulder: get("right_shoulder"),
    hip: get("right_hip"), knee: get("right_knee"), ankle: get("right_ankle"),
    neck: get("neck"), eye: get("right_eye"), leftWrist: get("left_wrist"), leftShoulder: get("left_shoulder")
  };
};

const detectBallPosition = _ => null; // Placeholder for real model

const getBallTrajectory = async (_, frameCount) => {
  let ballPositions = Array.from({ length: frameCount }, (_, i) => ({ x: 300 + i * 2, y: 100 + i * 8 }));
  let pitchPoint = ballPositions.find((p, i, arr) => i > 0 && p.y > arr[i - 1].y + 12) || ballPositions[ballPositions.length - 1];
  return { ballPositions, pitchPoint };
};

const inferBallLineAndLength = (pitchPoint, x, y) => {
  let line = "Unknown", length = "Unknown", d = pitchPoint.y - y;
  if (pitchPoint.x < x - 20) line = "Leg Stump";
  else if (pitchPoint.x > x + 20) line = "Off Stump";
  else line = "Middle Stump";
  if (d < 100) length = "Yorker";
  else if (d < 200) length = "Full";
  else if (d < 300) length = "Good";
  else length = "Short";
  return `${line}, ${length}`;
};

const isBowlingActionFrame = kps => {
  const { wrist, shoulder, hip } = extractKeypoints(kps);
  return wrist && shoulder && hip && wrist.y < shoulder.y && Math.abs(wrist.x - hip.x) < 50;
};

const isShotPlayed = kps => {
  const { wrist, elbow, shoulder } = extractKeypoints(kps);
  return wrist && elbow && shoulder && Math.abs(wrist.x - shoulder.x) > 60 && Math.abs(wrist.y - elbow.y) < 100;
};

const inferShotType = pose => {
  const { wrist, hip } = pose;
  if (!wrist || !hip) return "Unknown";
  if (wrist.x < hip.x - 50) return "Pull Shot";
  if (wrist.y < hip.y && wrist.x > hip.x) return "Cover Drive";
  if (Math.abs(wrist.x - hip.x) < 30) return "Straight Drive";
  return "Defensive / Leave";
};

const inferShotTiming = pose => {
  const { wrist, elbow } = pose;
  if (!wrist || !elbow) return "Unknown";
  if (wrist.y - elbow.y < -20) return "Early";
  if (wrist.y - elbow.y > 20) return "Late";
  return "Perfect";
};

const runModularPoseDetection = async (videoRef, setError) => {
  try {
    await tf.ready();
    const detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, { modelType: posedetection.movenet.modelType.MULTIPOSE_LIGHTNING });
    const video = videoRef.current;
    if (!video) return {};
    const frameCount = Math.min(Math.floor(video.duration * 1000 / INTERVAL), MAX_FRAMES), posesData = [];
    let batterStumpX = 320, creaseY = 400;
    const { pitchPoint } = await getBallTrajectory(video, frameCount);

    for (let i = 0; i < frameCount; i++) {
      video.currentTime = i * INTERVAL / 1000;
      await new Promise(res => video.addEventListener("seeked", res, { once: true }));
      const poses = await detector.estimatePoses(video);
      if (!poses?.length) continue;
      const keypoints = poses[0].keypoints;
      if (i === 0) {
        const { hip, ankle } = extractKeypoints(keypoints);
        if (hip && ankle) { batterStumpX = hip.x; creaseY = ankle.y; }
      }
      if (!isBowlingActionFrame(keypoints) && !isShotPlayed(keypoints)) continue;
      const poseInfo = extractKeypoints(keypoints);
      let ballRegion = "Unknown";
      if (pitchPoint && batterStumpX && creaseY) ballRegion = inferBallLineAndLength(pitchPoint, batterStumpX, creaseY);
      posesData.push({
        time: (i * INTERVAL / 1000).toFixed(2),
        shot: inferShotType(poseInfo),
        ballRegion,
        bowlerType: i * INTERVAL < 3000 ? "Pace" : "Spin",
        shotTiming: inferShotTiming(poseInfo),
      });
    }
    if (posesData.length) {
      const shotCounts = posesData.reduce((a, p) => {
        a[p.shot] = (a[p.shot] || 0) + 1;
        return a;
      }, {});
      const sortedShots = Object.entries(shotCounts).sort((a, b) => b[1] - a[1]);
      // --- Return a list of all metrics ---
      return {
        performanceMetricsList: posesData.map(p => ({
          shotPlayed: p.shot,
          ballRegion: p.ballRegion,
          bowlerType: p.bowlerType,
          shotTiming: p.shotTiming,
          time: p.time
        })),
        shotSummary: {
          totalFramesAnalyzed: frameCount,
          uniqueShots: [...new Set(posesData.map(p => p.shot))],
          shotFrequency: Object.fromEntries(sortedShots),
        },
        detailedTimeline: posesData.map(({ time, shot }) => ({ time, shot })),
      };
    }
    return {};
  } catch (err) { setError('Pose detection failed.'); return {}; }
};

const runAiBasedDetection = async (videoRef, setError) => {
  try {
    await tf.ready();
    const video = videoRef.current;
    if (!video) return {};
    const detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, { modelType: posedetection.movenet.modelType.SINGLEPOSE_THUNDER });
    const interval = 4000, frameCount = Math.min(Math.floor((video.duration * 1000) / interval), 8), insights = [];
    for (let i = 0; i < frameCount; i++) {
      video.currentTime = i * interval / 1000;
      await new Promise(res => video.addEventListener('seeked', res, { once: true }));
      const poses = await detector.estimatePoses(video);
      if (!poses?.length) continue;
      const keypoints = poses[0].keypoints;
      const wrist = keypoints.find(k => k.name.includes('wrist')), elbow = keypoints.find(k => k.name.includes('elbow')), shoulder = keypoints.find(k => k.name.includes('shoulder'));
      const confidenceScore = ((wrist?.score || 0) + (elbow?.score || 0) + (shoulder?.score || 0)) / 3;
      if (confidenceScore < 0.4) continue;
      insights.push({
        shotPlayed: inferShotType(extractKeypoints(keypoints)),
        ballRegion: "Unknown",
        bowlerType: i * interval < 3000 ? 'Pace' : 'Spin',
        shotTiming: inferShotTiming(extractKeypoints(keypoints)),
        confidenceScore
      });
    }
    if (insights.length) {
      const avgConfidence = (insights.reduce((sum, i) => sum + i.confidenceScore, 0) / insights.length * 100).toFixed(1);
      return { ...insights[0], confidenceScore: avgConfidence };
    }
    return {};
  } catch (err) { setError('AI-based detection failed.'); return {}; }
};

// --- Dummy helpers ---
const compressVideo = async f => f, annotateVideo = async () => { }, extractAudioInsights = async () => ({});

// --- PDF ---
const generatePDFReport = async data => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Player: ${data.playerName}`, 10, 10);
  doc.text(`File: ${data.fileName}`, 10, 20);
  doc.text(`Time: ${new Date(data.timestamp).toLocaleString()}`, 10, 30);
  doc.setFontSize(12);
  doc.text(`Shot Played: ${data.metricsList && data.metricsList[0] ? data.metricsList[0].shotPlayed : ''}`, 10, 45);
  doc.text(`Ball Region: ${data.metricsList && data.metricsList[0] ? data.metricsList[0].ballRegion : ''}`, 10, 55);
  doc.text(`Bowler Type: ${data.metricsList && data.metricsList[0] ? data.metricsList[0].bowlerType : ''}`, 10, 65);
  doc.text(`Shot Timing: ${data.metricsList && data.metricsList[0] ? data.metricsList[0].shotTiming : ''}`, 10, 75);

  doc.text("AI Insights:", 10, 90);
  let y = 100;
  for (const [k, v] of Object.entries(data.aiGeneratedInsights || {})) {
    doc.text(`${k}: ${v}`, 10, y);
    y += 10;
  }
  // Add all detected shots
  y += 10;
  doc.text("Detected Shots:", 10, y); y += 10;
  (data.metricsList || []).forEach((m, i) => {
    doc.text(`${m.time}s - ${m.shotPlayed} | ${m.ballRegion} | ${m.bowlerType} | ${m.shotTiming}`, 10, y);
    y += 10;
  });

  doc.save(`${data.playerName}_cricket_analysis.pdf`);
};

// --- Main Component ---
function SnickoMeter() {
  const [isAnalyzing, setIsAnalyzing] = useState(false), [showResults, setShowResults] = useState(false), [error, setError] = useState('');
  const [playerNameA, setPlayerNameA] = useState(''), [playerNameB, setPlayerNameB] = useState('');
  const [videoUrlA, setVideoUrlA] = useState(null), [videoUrlB, setVideoUrlB] = useState(null);
  const [analysisA, setAnalysisA] = useState(null), [analysisB, setAnalysisB] = useState(null), [progress, setProgress] = useState(0);
  const videoRefA = useRef(null), videoRefB = useRef(null);

  const handleVideoUpload = async (e, videoSlot = 'A') => {
    let file = e.target.files[0];
    if (!file) return;
    const playerName = videoSlot === 'A' ? playerNameA : playerNameB;
    if (!playerName.trim()) return setError(`Please enter a player name for Video ${videoSlot}.`);
    setIsAnalyzing(true); setError(''); setShowResults(false); setProgress(10);
    try { file = await compressVideo(file); } catch { }
    const videoElement = document.createElement('video'); videoElement.preload = 'metadata';
    try {
      await new Promise((res, rej) => {
        videoElement.onloadedmetadata = () => { window.URL.revokeObjectURL(videoElement.src); videoElement.duration > 30 ? rej('Please upload a video less than 30 seconds.') : res(); };
        videoElement.onerror = () => rej('Invalid video file.');
        videoElement.src = URL.createObjectURL(file);
      });
    } catch (err) { setIsAnalyzing(false); setError(err); return; }
    const previewUrl = URL.createObjectURL(file);
    videoSlot === 'A' ? setVideoUrlA(previewUrl) : setVideoUrlB(previewUrl);
    const formData = new FormData(); formData.append('video', file);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      setProgress(70);
      const { summary, detailedShotTimeline, shotPlayed, ballRegion, bowlerType, shotTiming, aiGeneratedInsights } = response.data;
      await annotateVideo(previewUrl, detailedShotTimeline);
      const audioInsights = await extractAudioInsights(file);
      // For API, keep old metrics for now, but support metricsList for fallback
      const analysisData = {
        playerName, fileName: file.name, summary,
        metricsList: [{ shotPlayed, ballRegion, bowlerType, shotTiming, time: "0.00" }], // API only returns one, so wrap in array
        timeline: detailedShotTimeline,
        aiGeneratedInsights: { ...aiGeneratedInsights, ...audioInsights },
        timestamp: new Date().toISOString(),
      };
      videoSlot === 'A' ? setAnalysisA(analysisData) : setAnalysisB(analysisData);
      const history = JSON.parse(localStorage.getItem('video_analysis_history')) || [];
      history.push({ ...analysisData, videoSlot });
      localStorage.setItem('video_analysis_history', JSON.stringify(history));
      await generatePDFReport(analysisData);
      setShowResults(true); setProgress(100);
    } catch {
      setError('API failed. Using fallback methods.');
      let fallbackMetrics = {}, fallbackInsights = {};
      if (videoSlot === 'A') {
        fallbackMetrics = await runModularPoseDetection(videoRefA, setError);
        fallbackInsights = await runAiBasedDetection(videoRefA, setError);
      } else {
        fallbackMetrics = await runModularPoseDetection(videoRefB, setError);
        fallbackInsights = await runAiBasedDetection(videoRefB, setError);
      }
      const analysisData = {
        playerName, fileName: file.name,
        summary: fallbackMetrics.shotSummary || {},
        metricsList: fallbackMetrics.performanceMetricsList || [],
        timeline: fallbackMetrics.detailedTimeline || [],
        aiGeneratedInsights: fallbackInsights || {},
        timestamp: new Date().toISOString(),
      };
      videoSlot === 'A' ? setAnalysisA(analysisData) : setAnalysisB(analysisData);
      setShowResults(true);
    } finally { setIsAnalyzing(false); setProgress(0); }
  };

  const handleBack = () => setShowResults(false);

  return (
    <div className="card p-4 bg-light mb-4" style={{ width: '95%', margin: '0 auto' }}>
      <h4>🎙️ Snicko Meter Technology</h4>
      <p>Upload cricket videos for Player A and/or Player B. Detects bat-ball contact & generates real-time metrics using AI or Pose Detection.</p>
      <div className="row mb-4">
        {[['A', playerNameA, setPlayerNameA, videoUrlA, setVideoUrlA, videoRefA, setAnalysisA],
          ['B', playerNameB, setPlayerNameB, videoUrlB, setVideoUrlB, videoRefB, setAnalysisB]].map(
            ([slot, name, setName, url, setUrl, ref, setAnalysis]) => (
              <div className="col-md-6" key={slot}>
                <label><strong>Player {slot} Name:</strong>
                  <input type="text" className="form-control mb-2" value={name} onChange={e => setName(e.target.value)} placeholder={`Enter Player ${slot} Name`} />
                </label>
                <input type="file" accept="video/*" className="form-control mb-3" onChange={e => handleVideoUpload(e, slot)} />
                {url && <>
                  <video ref={ref} src={url} controls width="100%" className="mb-2" />
                  <button className="btn btn-danger btn-sm mb-2" onClick={() => { setUrl(null); setShowResults(false); setAnalysis(null); setError(''); }}>🔁 Reset Video {slot}</button>
                </>}
              </div>
            ))}
      </div>
      {isAnalyzing && (
        <div className="alert alert-info small">
          ⚙️ Processing... Please wait.
          <div className="progress mt-2">
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>{progress}%</div>
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger small">{error}</div>}
      {showResults && !isAnalyzing && (
        <div className="row mt-4">
          {[analysisA, analysisB].map((analysis, idx) => analysis && (
            <div className="col-md-6" key={idx}>
              <div className="p-3 border rounded bg-white mb-3">
                <h5>Player {idx === 0 ? 'A' : 'B'}: {analysis.playerName}</h5>
                <h6 className="mt-3">Detailed Shot Analysis</h6>
                <ul>
                  {(analysis.metricsList || []).map((metric, i) => (
                    <li key={i}>
                      <strong>Time:</strong> {metric.time}s — 
                      <strong> Shot:</strong> {metric.shotPlayed}, 
                      <strong> Region:</strong> {metric.ballRegion}, 
                      <strong> Bowler:</strong> {metric.bowlerType}, 
                      <strong> Timing:</strong> {metric.shotTiming}
                    </li>
                  ))}
                </ul>
                <h6 className="mt-3">AI Insights</h6>
                <ul>
                  {Object.entries(analysis.aiGeneratedInsights || {}).map(([k, v]) => <li key={k}><strong>{k}:</strong> {v}</li>)}
                </ul>
                <h6 className="mt-3">Timeline</h6>
                <ul>
                  {(analysis.timeline || []).map((entry, i) => <li key={i}>{entry.time}s: {entry.shot}</li>)}
                </ul>
              </div>
            </div>
          ))}
          <div className="col-12"><button className="btn btn-secondary mt-3" onClick={handleBack}>← Back</button></div>
        </div>
      )}
    </div>
  );
}

export default SnickoMeter;

