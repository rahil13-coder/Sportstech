import React, { useRef, useEffect, useState } from "react";
import { trackClick } from '../utils/trackClick';

// Utility to wait for global JS libraries (like tf, poseDetection)
const waitForGlobal = (prop, timeout = 15000) =>
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
  const backFootX = Math.min(leftAnkle.x, rightAnkle.x);
  const frontFootX = Math.max(leftAnkle.x, rightAnkle.x);
  const hipCenterX = (leftHip.x + rightHip.x) / 2;
  let w = (hipCenterX - backFootX) / (frontFootX - backFootX || 1);
  w = Math.max(0, Math.min(1, w));
  return w; // 0 = back, 1 = forward
};

export default function BasketballTechnologies({ onBackClick }) {
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
  const [viewMode, setViewMode] = useState('analysis');
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rawVideoCanvasRef = useRef(null);
  const animationRef = useRef(null);

  const [log, setLog] = useState([]);
  const [objectModel, setObjectModel] = useState(null);
  const [poseDetector, setPoseDetector] = useState(null);

  // ✅ FIXED: Better YOLO Model Loading
  async function loadYoloModel() {
    console.log("⏳ Loading YOLOv8 model...");
    try {
      await waitForGlobal("YOLO");
      
      // Try multiple reliable model URLs
      const modelUrls = [
        "https://huggingface.co/ultralytics/yolov8n-tfjs/resolve/main/model.json",
        "https://tfhub.dev/tensorflow/tfjs-model/ssdlite_mobilenet_v2/1/default/1"
      ];
      
      for (const url of modelUrls) {
        try {
          window.yoloModel = await window.YOLO.load({
            modelUrl: url,
            scoreThreshold: 0.25,
            iouThreshold: 0.45
          });
          console.log(`✅ YOLOv8 loaded successfully from: ${url}`);
          setLog(prev => [...prev.slice(-50), `✅ YOLOv8 loaded from ${url}`]);
          return;
        } catch (e) {
          console.warn(`Failed to load YOLO from ${url}:`, e);
        }
      }
      throw new Error("All YOLO model URLs failed to load");
    } catch (err) {
      console.error("❌ YOLO Load Failed:", err);
      setLog(prev => [...prev.slice(-50), `❌ YOLO Load Failed: ${err.message}`]);
    }
  }

  useEffect(() => {
    trackClick('page-load-basketball-technologies-page', 'page-load', window.location.pathname);
    if (!showAnalytica) return;

    const loadModels = async () => {
      setIsLoadingModels(true);
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

      await loadYoloModel();
      setIsLoadingModels(false);
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
    video.onloadedmetadata = async () => {
      await loadYoloModel();
      setVideoLoaded(true);
      video.play().catch(err => console.error("Video play error:", err));
      setIsPlaying(true);
      video.playbackRate = playbackSpeed;
      startFrameLoop();
    };
    video.onerror = () => {
      console.error("Video loading error");
      setLog(prev => [...prev, "❌ Error loading video"]);
    };
    return () => URL.revokeObjectURL(video.src);
  }, [pendingVideoFile, playbackSpeed]);

  const startFrameLoop = () => {
    const loop = async () => {
      const video = videoRef.current;
      if (video && !video.paused && !video.ended) {
        if (viewMode === 'analysis') {
          if (objectModel && poseDetector) {
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
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * factor)));
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

  // ✅ FIXED: Complete processFrame with YOLO basketball detection
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
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
    ctx.drawImage(video, 0, 0, canvas.width / zoomLevel, canvas.height / zoomLevel);

    // ✅ YOLO ke liye 640x640 resized canvas
    const YOLO_INPUT_SIZE = 640;
    const yoloInputCanvas = document.createElement("canvas");
    yoloInputCanvas.width = YOLO_INPUT_SIZE;
    yoloInputCanvas.height = YOLO_INPUT_SIZE;
    const yoloCtx = yoloInputCanvas.getContext("2d");
    yoloCtx.drawImage(video, 0, 0, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // COCO-SSD person detection
      const predictions = await objectModel.detect(canvas);
      const persons = predictions.filter(p => p.class === "person" && p.score >= 0.5);
      const poses = await poseDetector.estimatePoses(tempCanvas);

      let ballsDetected = 0;

      // ✅ FIXED YOLO Basketball Detection
      if (window.yoloModel && typeof window.yoloModel.detect === 'function') {
        try {
          console.log("🔍 Running YOLO detection...");
          const yoloPredictions = await window.yoloModel.detect(yoloInputCanvas);
          console.log("YOLO predictions received:", yoloPredictions?.length || 0);

          // COCO dataset me basketball "sports ball" class hai
          const balls = yoloPredictions?.filter(p => 
            (p.class === "sports ball" || p.class === "basketball") && p.score > 0.25
          ) || [];

          ballsDetected = balls.length;

          // Coordinates ko original canvas size pe scale karo
          const scaleX = canvas.width / YOLO_INPUT_SIZE;
          const scaleY = canvas.height / YOLO_INPUT_SIZE;

          balls.forEach((ball) => {
            let x, y, width, height;
            
            // Handle different bbox formats
            if (Array.isArray(ball.bbox) && ball.bbox.length >= 4) {
              [x, y, width, height] = ball.bbox;
            } else {
              x = ball.x || 0;
              y = ball.y || 0;
              width = ball.width || 50;
              height = ball.height || 50;
            }

            const scaledX = x * scaleX;
            const scaledY = y * scaleY;
            const scaledW = width * scaleX;
            const scaledH = height * scaleY;

            ctx.strokeStyle = "red";
            ctx.lineWidth = 4 / zoomLevel;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);
            
            ctx.fillStyle = "white";
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2 / zoomLevel;
            ctx.font = `bold ${18 / zoomLevel}px Arial`;
            ctx.fillText(`🏀 ${(ball.score * 100).toFixed(1)}%`, scaledX, scaledY - 8 / zoomLevel);
            ctx.strokeText(`🏀 ${(ball.score * 100).toFixed(1)}%`, scaledX, scaledY - 8 / zoomLevel);
          });

          setLog(prev => [...prev.slice(-50), `🎾 YOLO: ${balls.length} basketballs detected`]);
        } catch (yoloErr) {
          console.error("YOLO detection failed:", yoloErr);
          setLog(prev => [...prev.slice(-50), `⚠️ YOLO Error: ${yoloErr.message}`]);
        }
      }

      // ✅ FIXED: COCO-SSD person detection with correct bbox format
      persons.forEach(p => {
        // COCO-SSD bbox format: [[x1,y1,x2,y2]]
        const bbox = p.bbox;
        if (!Array.isArray(bbox) || bbox.length < 4) return;
        
        const [x1, y1, x2, y2] = bbox;
        const x = x1;
        const y = y1;
        const width = x2 - x1;
        const height = y2 - y1;
        
        const personCenterX = x + width / 2;
        const personCenterY = y + height / 2;

        ctx.strokeStyle = COLORS.person;
        ctx.lineWidth = 3 / zoomLevel;
        ctx.strokeRect(x, y, width, height);
        ctx.font = `${16 / zoomLevel}px Arial`;
        ctx.fillStyle = COLORS.person;
        ctx.fillText(`player ${(p.score * 100).toFixed(0)}%`, x, y - 8 / zoomLevel);

        const closestPose = poses.reduce((closest, pose) => {
          const nose = pose.keypoints?.find(k => k.name === "nose");
          if (nose && nose.score > 0.3) {
            const dist = Math.hypot(nose.x - personCenterX, nose.y - personCenterY);
            if (!closest || dist < closest.dist) return { pose, dist };
          }
          return closest;
        }, null);

        if (closestPose?.pose) {
          drawSkeleton(ctx, closestPose.pose.keypoints, zoomLevel);
          const wt = computeWeightTransfer(closestPose.pose.keypoints);
          if (wt !== null) {
            window._weightHistory = window._weightHistory || [];
            const hist = window._weightHistory;
            hist.push(wt);
            if (hist.length > 5) hist.shift();
            const smoothWt = hist.reduce((a, b) => a + b, 0) / hist.length;
            drawWeightBar(ctx, x, y + height + 60, width, 30, smoothWt, zoomLevel);
            setWeightTransferData({ front: Math.round(smoothWt * 100), back: Math.round((1 - smoothWt) * 100) });
          }
        }
      });

      setLog(prev => [...prev.slice(-50), `🟢 Frame @ ${video.currentTime.toFixed(2)}s: ${persons.length} players, ${ballsDetected} balls`]);
    } catch (err) {
      console.error("Detection error:", err);
      setLog(prev => [...prev.slice(-50), `❌ Error at ${video.currentTime.toFixed(2)}s: ${err.message}`]);
    } finally {
      ctx.restore();
    }
  };

  const drawWeightBar = (ctx, x, y, w, h, value, zoomLevel) => {
    const labelHeight = 18 / zoomLevel;
    const barWidth = Math.max(120, w) / zoomLevel;
    const barHeight = h / zoomLevel;
    const scaledX = x / zoomLevel;
    const scaledY = y / zoomLevel;

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(scaledX, scaledY, barWidth, barHeight + labelHeight + 10 / zoomLevel);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${14 / zoomLevel}px Arial`;
    ctx.fillText("WEIGHT TRANSFER", scaledX + 10 / zoomLevel, scaledY + 16 / zoomLevel);
    
    const barX = scaledX + 10 / zoomLevel;
    const barY = scaledY + labelHeight;
    const innerW = barWidth - 20 / zoomLevel;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2 / zoomLevel;
    ctx.strokeRect(barX, barY, innerW, barHeight);
    
    const filled = innerW * value;
    ctx.fillStyle = "#00BFFF";
    ctx.fillRect(barX, barY, filled, barHeight);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `${12 / zoomLevel}px Arial`;
    ctx.fillText("BACK", barX + 5 / zoomLevel, barY + barHeight + 15 / zoomLevel);
    ctx.fillText("FRONT", barX + innerW - 40 / zoomLevel, barY + barHeight + 15 / zoomLevel);
  };

  const drawSkeleton = (ctx, keypoints, zoomLevel) => {
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
        ctx.arc(kp.x / zoomLevel, kp.y / zoomLevel, 5 / zoomLevel, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.skeleton;
        ctx.fill();
      }
    });
    
    pairs.forEach(([a, b]) => {
      const kpA = keypoints.find(k => k.name === a);
      const kpB = keypoints.find(k => k.name === b);
      if (kpA && kpB && kpA.score > 0.5 && kpB.score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(kpA.x / zoomLevel, kpA.y / zoomLevel);
        ctx.lineTo(kpB.x / zoomLevel, kpB.y / zoomLevel);
        ctx.strokeStyle = COLORS.skeleton;
        ctx.lineWidth = 3 / zoomLevel;
        ctx.stroke();
      }
    });
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setUseWebcam(false);
    setVideoLoaded(false);
    setShowResultScreen(true);
    setLog([]);
    setPendingVideoFile(file);
    setIsPlaying(true);
  };

  const handleWebcam = () => {
    setUseWebcam(true);
    setShowResultScreen(true);
    setLog([]);
  };

  useEffect(() => {
    let stream;
    const startWebcam = async () => {
      if (useWebcam) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } }
          });
          const video = videoRef.current;
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            setVideoLoaded(true);
            setIsPlaying(true);
            video.playbackRate = playbackSpeed;
            startFrameLoop();
          };
        } catch (err) {
          console.error("Webcam error:", err);
          setLog(prev => [...prev, "❌ Failed to access webcam"]);
          setUseWebcam(false);
        }
      }
    };
    startWebcam();
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };
  }, [useWebcam, facingMode, playbackSpeed]);

  return (
    <section style={{ padding: "20px", textAlign: 'center' }}>
      <h2 className="basketball" style={{ marginBottom: "12px", color: 'white' }}>BASKETBALL TECHNOLOGIES</h2>

      <button 
        className="btn-view-technologies" 
        onClick={() => { 
          setShowTechnologies(true); 
          trackClick('button-view-basketball-technologies', 'button', window.location.pathname); 
        }} 
        style={{ 
          display: 'block', 
          margin: '0 auto 10px auto', 
          backgroundColor: "#007bff", 
          color: "white",
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1em',
          cursor: 'pointer'
        }}
      >
        View Basketball Technologies
      </button>
      
      {onBackClick && (
        <button 
          onClick={onBackClick} 
          style={{ 
            display: 'block', 
            margin: '10px auto 0 auto', 
            padding: "10px 20px", 
            backgroundColor: "#ffffffcc", 
            border: "none", 
            borderRadius: "8px", 
            fontWeight: "bold", 
            cursor: "pointer", 
            zIndex: 10000 
          }}
        >
          ← Back
        </button>
      )}

      {showTechnologies && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: "100vw", 
          height: "100vh", 
          backgroundImage: "url('/background.jpg')", 
          backgroundSize: "cover", 
          backgroundPosition: "center", 
          backgroundRepeat: "no-repeat", 
          zIndex: 9999, 
          overflowY: "auto", 
          padding: 20 
        }}>
          <button 
            onClick={() => { 
              setShowTechnologies(false); 
              trackClick('button-basketball-technologies-back', 'button', window.location.pathname); 
            }} 
            style={{ 
              position: "absolute", 
              top: "20px", 
              left: "20px", 
              padding: "12px 24px", 
              backgroundColor: "#ffffffcc", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "bold", 
              cursor: "pointer", 
              zIndex: 10000,
              fontSize: '1em'
            }}
          >
            ← Back
          </button>

          <div>
            <button 
              className={showAnalytica ? "btn-close-analytica" : "btn-open-analytica"} 
              onClick={() => { 
                setShowAnalytica(prev => !prev); 
                trackClick('button-basketball-analytica-toggle', 'button', window.location.pathname); 
              }} 
              onMouseEnter={() => setIsAnalyticaHovered(true)}
              onMouseLeave={() => setIsAnalyticaHovered(false)} 
              style={{ 
                marginBottom: 20, 
                backgroundColor: isAnalyticaHovered ? '#007bff' : 'orange', 
                color: 'white', 
                border: 'none', 
                padding: '15px 30px', 
                borderRadius: '10px', 
                cursor: 'pointer',
                fontSize: '1.2em',
                fontWeight: 'bold'
              }}
            >
              {showAnalytica ? "Close Basketball Analytica" : "Open Basketball Analytica"}
            </button>

            {showAnalytica && (
              <>
                {isLoadingModels ? (
                  <div style={{ 
                    color: 'white', 
                    fontSize: '1.4em', 
                    marginBottom: 20, 
                    padding: '20px',
                    backgroundColor: 'rgba(0,123,255,0.2)',
                    borderRadius: '10px'
                  }}>
                    ⏳ Loading AI Models (COCO-SSD, MoveNet, YOLOv8)...
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      marginBottom: 20, 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '10px', 
                      flexWrap: 'wrap' 
                    }}>
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={handleUpload} 
                        style={{ 
                          fontSize: '1em', 
                          padding: '10px 15px', 
                          borderRadius: '8px',
                          border: '2px solid #007bff'
                        }} 
                      />
                      <select 
                        value={facingMode} 
                        onChange={e => setFacingMode(e.target.value)} 
                        style={{ 
                          padding: "10px 15px", 
                          borderRadius: "8px", 
                          fontSize: '1em',
                          border: '2px solid #007bff'
                        }}
                      >
                        <option value="user">📱 Front Camera</option>
                        <option value="environment">📷 Back Camera</option>
                      </select>
                      <button 
                        className="btn-use-webcam1" 
                        onClick={() => { 
                          handleWebcam(); 
                          trackClick('button-basketball-analytica-use-webcam', 'button', window.location.pathname); 
                        }} 
                        onMouseEnter={() => setIsWebcamHovered(true)}
                        onMouseLeave={() => setIsWebcamHovered(false)} 
                        style={{ 
                          backgroundColor: isWebcamHovered ? '#007bff' : 'orange', 
                          color: 'white', 
                          border: 'none', 
                          padding: '12px 20px', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontSize: '1em',
                          fontWeight: 'bold'
                        }}
                      >
                        🎥 Use Webcam
                      </button>
                      <button 
                        onClick={() => setViewMode(current => current === 'analysis' ? 'video' : 'analysis')} 
                        style={{ 
                          padding: '12px 20px', 
                          borderRadius: '8px', 
                          border: 'none', 
                          cursor: 'pointer', 
                          backgroundColor: '#007bff', 
                          color: 'white', 
                          fontSize: '1em',
                          fontWeight: 'bold'
                        }}
                      >
                        {viewMode === 'analysis' ? '📹 Show Raw Video' : '🔍 Show Analysis'}
                      </button>
                    </div>

                    {showResultScreen && (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        maxWidth: '960px', 
                        margin: '20px auto' 
                      }}>
                        <div style={{ 
                          width: '100%', 
                          marginBottom: '20px', 
                          border: '2px solid #007bff', 
                          borderRadius: '12px', 
                          overflow: 'hidden' 
                        }}>
                          <video
                            ref={videoRef}
                            style={{ display: "none" }}
                            muted
                            autoPlay
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                          />
                        </div>

                        {videoLoaded && (
                          <div style={{ 
                            width: '100%', 
                            marginBottom: '10px', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '8px', 
                            padding: '15px', 
                            backgroundColor: '#333', 
                            borderRadius: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <button 
                              onClick={handlePlayPause} 
                              style={{ 
                                padding: '10px 16px', 
                                fontSize: '0.9em', 
                                borderRadius: '8px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                backgroundColor: isPlaying ? '#dc3545' : '#28a745', 
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                            </button>
                            <button 
                              onClick={() => handleSkip(-5)} 
                              style={{ 
                                padding: '10px 16px', 
                                fontSize: '0.9em', 
                                borderRadius: '8px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                backgroundColor: '#6c757d', 
                                color: 'white' 
                              }}
                            >
                              ⏪ -5s
                            </button>
                            <button 
                              onClick={() => handleSkip(5)} 
                              style={{ 
                                padding: '10px 16px', 
                                fontSize: '0.9em', 
                                borderRadius: '8px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                backgroundColor: '#6c757d', 
                                color: 'white' 
                              }}
                            >
                              ⏩ +5s
                            </button>
                            <button 
                              onClick={() => handleZoom(1.2)} 
                              style={{ 
                                padding: '10px 16px', 
                                fontSize: '0.9em', 
                                borderRadius: '8px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                backgroundColor: '#28a745', 
                                color: 'white' 
                              }}
                            >
                              🔍 Zoom In
                            </button>
                            <button 
                              onClick={() => handleZoom(0.8)} 
                              style={{ 
                                padding: '10px 16px', 
                                fontSize: '0.9em', 
                                borderRadius: '8px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                backgroundColor: '#dc3545', 
                                color: 'white' 
                              }}
                            >
                              🔎 Zoom Out
                            </button>
                            <select 
                              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))} 
                              value={playbackSpeed} 
                              style={{ 
                                padding: '10px 16px', 
                                fontSize: '0.9em', 
                                borderRadius: '8px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                backgroundColor: '#6c757d', 
                                color: 'white' 
                              }}
                            >
                              <option value={0.5}>0.5x</option>
                              <option value={0.75}>0.75x</option>
                              <option value={1}>1x</option>
                              <option value={1.5}>1.5x</option>
                              <option value={2}>2x</option>
                            </select>
                          </div>
                        )}

                        {videoLoaded && (
                          <div style={{ 
                            position: 'relative', 
                            width: '100%', 
                            overflow: 'hidden', 
                            border: '2px solid #007bff', 
                            borderRadius: '12px', 
                            marginTop: '10px', 
                            maxHeight: '70vh',
                            backgroundColor: '#000'
                          }}>
                            {viewMode === 'analysis' && (
                              <canvas
                                ref={canvasRef}
                                style={{ 
                                  display: 'block', 
                                  maxWidth: "100%", 
                                  maxHeight: "100%", 
                                  width: "auto", 
                                  height: "auto", 
                                  objectFit: 'contain', 
                                  transform: `scale(${zoomLevel})`, 
                                  transformOrigin: 'center center' 
                                }}
                              />
                            )}
                            {viewMode === 'video' && (
                              <canvas
                                ref={rawVideoCanvasRef}
                                style={{ 
                                  display: 'block', 
                                  maxWidth: "100%", 
                                  maxHeight: "100%", 
                                  width: "auto", 
                                  height: "auto", 
                                  objectFit: 'contain', 
                                  transform: `scale(${zoomLevel})`, 
                                  transformOrigin: 'center center' 
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ 
                      marginTop: 25, 
                      padding: 20, 
                      backgroundColor: "#ffffffcc", 
                      borderRadius: 12,
                      maxWidth: '960px',
                      margin: '25px auto'
                    }}>
                      <h4 style={{ margin: 0, color: '#333', fontSize: '1.3em' }}>⚖️ Weight Transfer Analysis</h4>
                      {weightTransferData ? (
                        <div>
                          <p style={{ fontSize: '1.2em', margin: '10px 0' }}>
                            Front Foot: <strong style={{ color: 'cyan' }}>{weightTransferData.front}%</strong> | 
                            Back Foot: <strong style={{ color: 'orange' }}>{weightTransferData.back}%</strong>
                          </p>
                          <div style={{ 
                            width: '100%', 
                            backgroundColor: '#333', 
                            height: 25, 
                            borderRadius: 12, 
                            border: '2px solid white',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${weightTransferData.front}%`, 
                              background: 'linear-gradient(90deg, cyan, blue)', 
                              height: '100%', 
                              borderRadius: '10px 0 0 10px',
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>
                          No weight transfer data available. Play a basketball video to see analysis in real-time.
                        </p>
                      )}
                    </div>

                    <div style={{ 
                      marginTop: 25, 
                      padding: 20, 
                      backgroundColor: "#ffffffcc", 
                      borderRadius: 12,
                      maxWidth: '960px',
                      margin: '25px auto'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: showLogs ? 15 : 0 
                      }}>
                        <h4 style={{ margin: 0, color: '#333', fontSize: '1.3em' }}>📋 Real-time Logs</h4>
                        <button 
                          onClick={() => setShowLogs(prev => !prev)} 
                          style={{ 
                            padding: '8px 16px', 
                            backgroundColor: '#007bff', 
                            color: 'white',
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          {showLogs ? "Hide Logs" : "Show Logs"}
                        </button>
                      </div>
                      {showLogs && (
                        <div style={{ 
                          maxHeight: "35vh", 
                          overflowY: "auto", 
                          fontFamily: "monospace", 
                          fontSize: 13, 
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          lineHeight: '1.4'
                        }}>
                          {log.length > 0 ? 
                            log.map((msg, i) => <div key={i} style={{ marginBottom: '4px' }}>{msg}</div>) : 
                            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                              No data yet. Upload a basketball video or use webcam to start AI analysis (players, basketballs, pose, weight transfer).
                            </div>
                          }
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
