import React, { useRef, useEffect, useState } from "react";

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

export default function FootballTechnologies() {
  const [showTechnologies, setShowTechnologies] = useState(false);
  const [showAnalytica, setShowAnalytica] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [pendingVideoFile, setPendingVideoFile] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [log, setLog] = useState([]);
  const [objectModel, setObjectModel] = useState(null);
  const [poseDetector, setPoseDetector] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const lastDetectionTimeRef = useRef(0);

  useEffect(() => {
    if (!showAnalytica) return;
    const loadModels = async () => {
      try {
        await waitForGlobal("cocoSsd");
        const model = await window.cocoSsd.load();
        setObjectModel(model);
        setLog(prev => [...prev, "✅ COCO-SSD Loaded"]);
      } catch (err) {
        console.error(err);
        setLog(prev => [...prev, "❌ Failed to load COCO-SSD"]);
      }

      try {
        await waitForGlobal("poseDetection");
        const detector = await window.poseDetection.createDetector(
          window.poseDetection.SupportedModels.MoveNet,
          {
            modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          }
        );
        setPoseDetector(detector);
        setLog(prev => [...prev, "✅ MoveNet Loaded"]);
      } catch (err) {
        console.error(err);
        setLog(prev => [...prev, "❌ Failed to load MoveNet"]);
      }
    };
    loadModels();
    return () => cancelAnimationFrame(animationRef.current);
  }, [showAnalytica]);

  useEffect(() => {
    if (!pendingVideoFile || !videoRef.current) return;
    const video = videoRef.current;
    video.src = URL.createObjectURL(pendingVideoFile);
    video.onloadedmetadata = () => {
      setVideoLoaded(true);
      video.play();
      startFrameLoop();
    };
    video.onerror = () => {
      setLog(prev => [...prev, "❌ Error loading video"]);
    };
    return () => URL.revokeObjectURL(video.src);
  }, [pendingVideoFile, objectModel, poseDetector]);

  const startFrameLoop = () => {
    const loop = async (now) => {
      if (performance.now() - lastDetectionTimeRef.current > 100) {
        lastDetectionTimeRef.current = performance.now();
        await processFrame();
      }
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
  };

  const processFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !objectModel || !poseDetector) return;

    const ctx = canvas.getContext("2d");
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    if (facingMode === "user") {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -w, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, w, h);
    }

    const predictions = await objectModel.detect(canvas);
    const persons = predictions.filter(p => p.class === "person" && p.score >= 0.5);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(video, 0, 0, w, h);
    const poses = await poseDetector.estimatePoses(tempCanvas);

    if (persons.length === 0) {
      setLog(prev => [...prev.slice(-50), `⚠️ No players detected at ${video.currentTime.toFixed(2)}s`]);
    }

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

      // Match all skeletons
      poses.forEach(pose => {
        const nose = pose.keypoints.find(k => k.name === "nose");
        if (nose && nose.score > 0.3) {
          const d = Math.hypot(nose.x - personCenterX, nose.y - personCenterY);
          if (d < 150) {
            drawSkeleton(ctx, pose.keypoints);
          }
        }
      });

      const id = `${Math.round(personCenterX)}-${Math.round(personCenterY)}`;
      if (!window._lastPlayerPositions) window._lastPlayerPositions = {};
      const prev = window._lastPlayerPositions[id] || { x: personCenterX, y: personCenterY, t: video.currentTime };
      const dx = personCenterX - prev.x;
      const dy = personCenterY - prev.y;
      const dt = video.currentTime - prev.t || 0.1;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;
      const centerLine = canvas.width / 2;
      const lateralDistance = Math.abs(personCenterX - centerLine);
      window._lastPlayerPositions[id] = { x: personCenterX, y: personCenterY, t: video.currentTime };

      let zone = "Center";
      if (personCenterX < canvas.width / 3) zone = "Left Wing";
      else if (personCenterX > (2 * canvas.width) / 3) zone = "Right Wing";

      ctx.fillStyle = "yellow";
      ctx.fillText(`📏 ${lateralDistance.toFixed(1)} px`, x, y + height + 12);
      ctx.fillText(`🏃 ${speed.toFixed(1)} px/s`, x, y + height + 26);
      ctx.fillStyle = "violet";
      ctx.fillText(`📍 ${zone}`, x, y + height + 40);
    });

    setLog(prev => [
      ...prev.slice(-50),
      `🟢 Frame @ ${video.currentTime.toFixed(2)}s: ${persons.length} players detected`
    ]);
  };

  const drawSkeleton = (ctx, keypoints) => {
    const pairs = [
      ["left_shoulder", "right_shoulder"],
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_hip", "right_hip"],
      ["left_hip", "left_knee"],
      ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"],
      ["right_knee", "right_ankle"]
    ];

    keypoints.forEach(kp => {
      if (kp.score > 0.5 && kp.x && kp.y) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 4, 0, Math.PI * 2);
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
  };

  const handleWebcam = async () => {
    setUseWebcam(true);
    setShowResultScreen(true);
    setLog([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 480 },
          height: { ideal: 360 }
        }
      });
      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        setVideoLoaded(true);
        startFrameLoop();
      };
    } catch (err) {
      console.error("Webcam error:", err);
      setLog(prev => [...prev, "❌ Webcam Access Error"]);
    }
  };

  return (
    <section style={{ padding: 20 }}>
      <h2>Football TECHNOLOGIES</h2>
      <button onClick={() => setShowTechnologies(true)} style={{ marginBottom: 10 }}>
        View Football Technologies
      </button>

      {showTechnologies && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000000dd", padding: 20, overflowY: "auto", zIndex: 9999 }}>
          <button onClick={() => setShowTechnologies(false)} style={{ background: "#fff", padding: 10, borderRadius: 8 }}>
            ← Back
          </button>

          <div style={{ marginTop: 10 }}>
            <button onClick={() => setShowAnalytica(prev => !prev)} style={{ marginBottom: 10 }}>
              {showAnalytica ? "Close Football Analytica" : "Football Analytica"}
            </button>

            {showAnalytica && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <input type="file" accept="video/*" onChange={handleUpload} />
                  <select value={facingMode} onChange={e => setFacingMode(e.target.value)} style={{ marginLeft: 10 }}>
                    <option value="user">Front Camera</option>
                    <option value="environment">Back Camera</option>
                  </select>
                  <button onClick={handleWebcam} style={{ marginLeft: 10 }}>Use Webcam</button>
                </div>

                {showResultScreen && (
                  <div style={{ position: "relative" }}>
                    <video
                      ref={videoRef}
                      style={{ width: "100%", maxWidth: "100vw", background: "#000", display: videoLoaded ? "block" : "none" }}
                      controls={!useWebcam}
                      muted
                      autoPlay
                    />
                    {videoLoaded && (
                      <canvas
                        ref={canvasRef}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "auto",
                          maxWidth: "100vw",
                          pointerEvents: "none"
                        }}
                      />
                    )}
                  </div>
                )}

                <div style={{
                  marginTop: 20,
                  padding: 10,
                  backgroundColor: "#ffffffcc",
                  borderRadius: 5,
                  maxHeight: "35vh",
                  overflowY: "auto",
                  fontFamily: "monospace",
                  fontSize: 12
                }}>
                  {log.length > 0 ? log.map((msg, i) => (<div key={i}>{msg}</div>)) : (
                    <div>No data yet. Upload a football video or use the webcam to get started.</div>
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
