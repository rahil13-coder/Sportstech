import React, { useRef, useEffect, useState } from "react";
import { trackClick } from '../utils/trackClick'; // Import trackClick

// Utility to wait for global JS libraries (like tf, poseDetection)
const waitForGlobal = (prop, timeout = 10000) =>
  new Promise((resolve, reject) => {
    let elapsed = 0;
    const tick = setInterval(() => {
      if (window[prop]) {
        clearInterval(tick);
        resolve();
      } else if ((elapsed += 100) >= timeout) {
        clearInterval(tick);
        reject(new Error(`Global ${prop} not loaded`));
      }
    }, 100);
  });

const COLORS = {
  person: "lime",
  skeleton: "cyan",
};

const computeWeightTransfer = (keypoints) => {
  const get = name => keypoints.find(k => k.name === name && k.score > 0.4);
  const leftAnkle = get("left_ankle");
  const rightAnkle = get("right_ankle");
  const leftHip = get("left_hip");
  const rightHip = get("right_hip");
  if (!leftAnkle || !rightAnkle || !leftHip || !rightHip) return null;
  // Feet and hip centers
  const backFootX = Math.min(leftAnkle.x, rightAnkle.x);
  const frontFootX = Math.max(leftAnkle.x, rightAnkle.x);
  const hipCenterX = (leftHip.x + rightHip.x) / 2;
  // Normalize between feet; clamp 0–1
  let w = (hipCenterX - backFootX) / (frontFootX - backFootX || 1);
  w = Math.max(0, Math.min(1, w));
  return w;   // 0 = back, 1 = forward
};

export default function TennisTechnologies({ onBackClick }) {
  const [showTechnologies, setShowTechnologies] = useState(false);
  const [showAnalytica, setShowAnalytica] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [pendingVideoFile, setPendingVideoFile] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [isWebcamHovered, setIsWebcamHovered] = useState(false);
  const [isAnalyticaHovered, setIsAnalyticaHovered] = useState(false);
  const [weightTransferData, setWeightTransferData] = useState(null);
  const [showLogs, setShowLogs] = useState(true);
  const [yoloModelUrl, setYoloModelUrl] = useState(null);
  const [viewMode, setViewMode] = useState('analysis'); // 'analysis' or 'video'

  const [deepSortTracker, setDeepSortTracker] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // New state for playback speed

  const videoRef = useRef(null);
  const canvasRef = useRef(null); // For analysis output
  const rawVideoCanvasRef = useRef(null); // New ref for raw video output
  const animationRef = useRef(null);

  const [log, setLog] = useState([]);
  const [objectModel, setObjectModel] = useState(null);
  const [poseDetector, setPoseDetector] = useState(null);
  const [yoloModel, setYoloModel] = useState(null);
  

  useEffect(() => {
    trackClick('page-load-tennis-technologies-page', 'page-load', window.location.pathname);
    if (!showAnalytica) return;

    const loadModels = async () => {
      try {
        await waitForGlobal("cocoSsd");
        const model = await window.cocoSsd.load();
        setObjectModel(model);
        setLog(prev => [...prev.slice(-50), "✅ COCO-SSD Model Loaded"]);
      } catch (err) {
        console.error("COCO-SSD load error:", err);
        setLog(prev => [...prev.slice(-50), "❌ Failed to load COCO-SSD"]);
      }

      try {
        await waitForGlobal("poseDetection");
        const detector = await window.poseDetection.createDetector(
          window.poseDetection.SupportedModels.MoveNet,
          { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        setPoseDetector(detector);
        setLog(prev => [...prev.slice(-50), "✅ MoveNet Pose Detector Loaded"]);
      } catch (err) {
        console.error("Pose detector load error:", err);
        setLog(prev => [...prev.slice(-50), "❌ Failed to load MoveNet"]);
      }

      try {
        if (window.YOLO) {
          const modelUrl = "https://huggingface.co/Jocher/yolov8n-tfjs/resolve/main/yolov8n_web_model.json";
          const yoloInstance = new window.YOLO();
          await yoloInstance.setup({ modelUrl, scoreThreshold: 0.5, iouThreshold: 0.45 });
          setYoloModelUrl(modelUrl);
          setYoloModel(yoloInstance);
          setLog(prev => [...prev.slice(-50), "✅ YOLOv8 Ready for ball detection"]);
        }
      } catch (err) {
        setLog(prev => [...prev.slice(-50), `❌ YOLO setup failed: ${err.message}`]);
      }

      try {
        if (window.DeepSORT) {
          const tracker = new window.DeepSORT({ max_age: 30, n_init: 3, nn_budget: 100 });
          setDeepSortTracker(tracker);
          setLog(prev => [...prev.slice(-50), "✅ DeepSORT Ready"]);
        }
      } catch (err) {
        setLog(prev => [...prev.slice(-50), `❌ DeepSORT initialization failed: ${err.message}`]);
      }
    };

    loadModels();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showAnalytica]);

  useEffect(() => {
    if (!pendingVideoFile || !videoRef.current) return;
    const video = videoRef.current;
    video.src = URL.createObjectURL(pendingVideoFile);
    video.onloadedmetadata = () => {
      setVideoLoaded(true);
      video.play().catch(err => console.error("Video play error:", err));
      setIsPlaying(true); // Set playing state when video loads
      video.playbackRate = playbackSpeed; // Set initial playback speed
      startFrameLoop();
    };
    video.onerror = () => {
      console.error("Video loading error");
      setLog(prev => [...prev, "❌ Error loading video"]);
    };
    return () => URL.revokeObjectURL(video.src);
  }, [pendingVideoFile, playbackSpeed]); // Add playbackSpeed to dependencies

  const startFrameLoop = () => {
    const loop = async () => {
      const video = videoRef.current;
      if (video && !video.paused && !video.ended) {
        if (viewMode === 'analysis') {
          if (objectModel && poseDetector) { // Only require models for analysis view
            await processFrame();
          }
        } else if (viewMode === 'video') {
          drawRawVideoFrame();
        }
      }
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime += seconds;
    }
  };

  const handleZoom = (factor) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * factor))); // Limit zoom between 0.5x and 3x
  };

  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const drawRawVideoFrame = () => {
    const video = videoRef.current;
    const canvas = rawVideoCanvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  };

  const processFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !objectModel || !poseDetector) return;

    const ctx = canvas.getContext("2d");
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const predictions = await objectModel.detect(canvas);
      const persons = predictions.filter(p => p.class === "person" && p.score >= 0.5);
      const poses = await poseDetector.estimatePoses(tempCanvas);

      let ballsDetected = 0;
      let trackedBalls = [];
      if (yoloModel && video.videoWidth > 0) {
        try {
          const yoloPredictions = await yoloModel.detect(video);
          const balls = yoloPredictions.filter(p => (p.class === "sports ball" || p.class.includes("ball")) && p.score > 0.4);
          ballsDetected = balls.length;

          if (deepSortTracker && balls.length > 0) {
            const detections = balls.map(ball => {
              const [x, y, w, h] = ball.bbox;
              return [x, y, w, h, ball.score, 1];
            });
            trackedBalls = deepSortTracker.update(detections);
          }

          balls.forEach((ball) => {
            const [x, y, w, h] = ball.bbox;
            ctx.strokeStyle = "red";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = "white";
            ctx.font = "bold 16px Arial";
            ctx.fillText(`⚽ ${Math.round(ball.score*100)}%`, x, y-5);
          });

        } catch (yoloErr) {
          console.warn("YOLO detection failed:", yoloErr);
        }
      }
      
      trackedBalls.forEach(obj => {
        const [x, y, w, h, trackId] = obj;
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = "lime";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`ID:${trackId}`, x, y-10);
      });

      persons.forEach(p => {
        const [x, y, width, height] = p.bbox;
        const personCenterX = x + width / 2;
        const personCenterY = y + height / 2;

        ctx.strokeStyle = COLORS.person;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.font = "14px Arial";
        ctx.fillStyle = COLORS.person;
        ctx.fillText("player", x, y - 6);

        const closestPose = poses.reduce((closest, pose) => {
          const nose = pose.keypoints?.find(k => k.name === "nose");
          if (nose && nose.score > 0.3) {
            const dist = Math.hypot(nose.x - personCenterX, nose.y - personCenterY);
            if (!closest || dist < closest.dist) return { pose, dist };
          }
          return closest;
        }, null);

        if (closestPose?.pose) {
          drawSkeleton(ctx, closestPose.pose.keypoints);
          const wt = computeWeightTransfer(closestPose.pose.keypoints);
          if (wt !== null) {
            window._weightHistory = window._weightHistory || [];
            const hist = window._weightHistory;
            hist.push(wt);
            if (hist.length > 5) hist.shift();
            const smoothWt = hist.reduce((a,b) => a + b, 0) / hist.length;
            drawWeightBar(ctx, x, y + height + 60, width, 30, smoothWt);
            setWeightTransferData({ front: Math.round(smoothWt * 100), back: Math.round((1 - smoothWt) * 100) });
          }
        }
      });

      setLog(prev => [...prev.slice(-50), `🟢 Frame @ ${video.currentTime.toFixed(2)}s: ${persons.length} players, ${ballsDetected} balls detected`]);
    } catch (err) {
      console.error("Detection error:", err);
      setLog(prev => [...prev.slice(-50), `❌ Error at ${video.currentTime.toFixed(2)}s`]);
    }
  };

  const drawWeightBar = (ctx, x, y, w, h, value) => {
    const labelHeight = 18;
    const barWidth = Math.max(120, w);
    const barHeight = h;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(x, y, barWidth, barHeight + labelHeight + 8);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 12px Arial";
    ctx.fillText("WEIGHT TRANSFER", x + 8, y + 14);
    const barX = x + 8;
    const barY = y + labelHeight;
    const innerW = barWidth - 16;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, innerW, barHeight);
    const filled = innerW * value;
    ctx.fillStyle = "#00BFFF";
    ctx.fillRect(barX, barY, filled, barHeight);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px Arial";
    ctx.fillText("0%", barX, barY + barHeight + 10);
    const txt = "100%";
    const tw = ctx.measureText(txt).width;
    ctx.fillText(txt, barX + innerW - tw, barY + barHeight + 10);
  };

  const drawSkeleton = (ctx, keypoints) => {
    const pairs = [
      ["left_shoulder", "right_shoulder"], ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"], ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"], ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"], ["left_hip", "right_hip"],
      ["left_hip", "left_knee"], ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"], ["right_knee", "right_ankle"]
    ];
    keypoints.forEach(kp => {
      if (kp.score > 0.5 && kp.x && kp.y) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.skeleton;
        ctx.fill();
      }
    });
    pairs.forEach(([a, b]) => {
      const kpA = keypoints.find(k => k.name === a);
      const kpB = keypoints.find(k => k.name === b);
      if (kpA && kpB && kpA.score > 0.5 && kpB.score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(kpA.x, kpA.y);
        ctx.lineTo(kpB.x, kpB.y);
        ctx.strokeStyle = COLORS.skeleton;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUseWebcam(false);
    setVideoLoaded(false);
    setShowResultScreen(true);
    setLog([]);
    setPendingVideoFile(file);
    setIsPlaying(true); // Assume video will play on upload
  };

  const handleWebcam = async () => {
    setUseWebcam(true);
    setShowResultScreen(true);
    setLog([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } }
      });
      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        setVideoLoaded(true);
        setIsPlaying(true); // Set playing state when webcam starts
        video.playbackRate = playbackSpeed; // Set initial playback speed for webcam
        startFrameLoop();
      };
    } catch (err) {
      console.error("Webcam error:", err);
      setLog(prev => [...prev, "❌ Failed to access webcam"]);
    }
  };

  return (
    <section style={{ padding: "20px", textAlign: 'center' }}>
      <h2 className="tennis" style={{ marginBottom: "12px", color: 'white' }}> BASKETBALL TECHNOLOGIES </h2>

      <button className="btn-view-technologies" onClick={() => { setShowTechnologies(true); trackClick('button-view-tennis-technologies', 'button', window.location.pathname); }} style={{ display: 'block', margin: '0 auto 10px auto', backgroundColor: "#007bff", color: "white" }}>
        View Basketball Technologies
      </button>
      {onBackClick && (
        <button onClick={onBackClick} style={{ display: 'block', margin: '10px auto 0 auto', padding: "10px 20px", backgroundColor: "#ffffffcc", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", zIndex: 10000 }}>
            ← Back
        </button>
      )}

      {showTechnologies && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundImage: "url('/background.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", zIndex: 9999, overflowY: "auto", padding: 20 }}>
          <button onClick={() => { setShowTechnologies(false); trackClick('button-tennis-technologies-back', 'button', window.location.pathname); }} style={{ position: "absolute", top: "20px", left: "20px", padding: "10px 20px", backgroundColor: "#ffffffcc", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", zIndex: 10000 }}>
            ← Back
          </button>

          <div>
            <button className={showAnalytica ? "btn-close-analytica" : "btn-open-analytica"} onClick={() => { setShowAnalytica(prev => !prev); trackClick('button-tennis-analytica-toggle', 'button', window.location.pathname); }} onMouseEnter={() => setIsAnalyticaHovered(true)} onMouseLeave={() => setIsAnalyticaHovered(false)} style={{ marginBottom: 10, backgroundColor: isAnalyticaHovered ? '#007bff' : 'orange', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
              {showAnalytica ? "Close " : "Basketball Analytica"}
            </button>

            {showAnalytica && (
              <>
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}> {/* Reduced gap, added flexWrap */}
                  <input type="file" accept="video/*" onChange={handleUpload} style={{ fontSize: '0.8em', padding: '4px 8px', borderRadius: '5px' }} /> {/* Smaller font/padding for input */}
                  <select value={facingMode} onChange={e => setFacingMode(e.target.value)} style={{ padding: "4px 8px", borderRadius: "5px", fontSize: '0.8em' }}> {/* Smaller font/padding for select */}
                    <option value="user">Front Camera</option>
                    <option value="environment">Back Camera</option>
                  </select>
                  <button className="btn-use-webcam1" onClick={() => { handleWebcam(); trackClick('button-tennis-analytica-use-webcam', 'button', window.location.pathname); }} onMouseEnter={() => setIsWebcamHovered(true)} onMouseLeave={() => setIsWebcamHovered(false)} style={{ backgroundColor: isWebcamHovered ? '#007bff' : 'orange', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8em' }}> {/* Smaller font/padding for button */}
                    Use Webcam
                  </button>
                  <button onClick={() => setViewMode(current => current === 'analysis' ? 'video' : 'analysis')} style={{ padding: '6px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', fontSize: '0.8em' }}> {/* Smaller font/padding for button */}
                    {viewMode === 'analysis' ? 'Show Raw Video' : 'Show Analysis'}
                  </button>
                </div>

                {showResultScreen && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '960px', margin: '20px auto' }}>
                    {/* Video Player Area */}
                    <div style={{ width: '100%', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                      <video
                        ref={videoRef}
                        style={{ display: "none" }} // Hidden, serves as source
                        muted
                        autoPlay
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    </div>

                    {/* Controls for the active canvas */}
                      {videoLoaded && (
                        <div style={{ width: '100%', marginBottom: '0px', display: 'flex', justifyContent: 'center', gap: '5px', padding: '10px', backgroundColor: '#333', borderRadius: '8px' }}>
                          <button onClick={handlePlayPause} style={{ padding: '6px 10px', fontSize: '0.8em', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#007bff', color: 'white' }}>
                            {isPlaying ? 'Pause' : 'Play'}
                          </button>
                          <button onClick={() => handleSkip(-5)} style={{ padding: '6px 10px', fontSize: '0.8em', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#007bff', color: 'white' }}>
                            -5s
                          </button>
                          <button onClick={() => handleSkip(5)} style={{ padding: '6px 10px', fontSize: '0.8em', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#007bff', color: 'white' }}>
                            +5s
                          </button>
                          <button onClick={() => handleZoom(1.1)} style={{ padding: '6px 10px', fontSize: '0.8em', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#28a745', color: 'white' }}>
                            Zoom In
                          </button>
                          <button onClick={() => handleZoom(1 / 1.1)} style={{ padding: '6px 10px', fontSize: '0.8em', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white' }}>
                            Zoom Out
                          </button>
                          <select onChange={(e) => handleSpeedChange(parseFloat(e.target.value))} value={playbackSpeed} style={{ padding: '6px 10px', fontSize: '0.8em', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white' }}>
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                          </select>
                        </div>
                      )}

                      {/* Canvas Display Area */}
                      {videoLoaded && (
                        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', border: '1px solid #ccc', borderRadius: '8px', marginTop: '0px', maxHeight: '80vh' }}>
                          {viewMode === 'analysis' && (
                            <canvas
                              ref={canvasRef}
                              style={{ display: 'block', maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: 'contain', transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                            />
                          )}
                          {viewMode === 'video' && (
                            <canvas
                              ref={rawVideoCanvasRef}
                              style={{ display: 'block', maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: 'contain', transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                            />
                          )}
                        </div>
                      )}
                  </div>
                )}

                <div style={{ marginTop: 20, padding: 10, backgroundColor: "#ffffffcc", borderRadius: 5 }}>
                  <h4>Weight Transfer</h4>
                  {weightTransferData ? (
                    <div>
                      <p>Front: {weightTransferData.front}% | Back: {weightTransferData.back}%</p>
                      <div style={{ width: '100%', backgroundColor: '#333', height: 20, borderRadius: 5, border: '1px solid white' }}>
                        <div style={{ width: `${weightTransferData.front}%`, backgroundColor: 'cyan', height: '100%', borderRadius: 5 }}></div>
                      </div>
                    </div>
                  ) : (
                    <p>No weight transfer data available. Play a video to see the analysis.</p>
                  )}
                </div>

                <div style={{ marginTop: 20, padding: 10, backgroundColor: "#ffffffcc", borderRadius: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showLogs ? 10 : 0 }}>
                    <h4 style={{ margin: 0 }}>Logs</h4>
                    <button onClick={() => setShowLogs(prev => !prev)} style={{ padding: '2px 8px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
                      {showLogs ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showLogs && (
                    <div style={{ maxHeight: "30vh", overflowY: "auto", fontFamily: "monospace", fontSize: 12, paddingTop: 10, borderTop: '1px solid #ccc' }}>
                      {log.length > 0 ? log.map((msg, i) => <div key={i}>{msg}</div>) : <div>No data yet. Upload a tennis video or use webcam to start analysis.</div>}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
