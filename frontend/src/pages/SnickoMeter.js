import { useRef, useEffect, useState } from "react";
import SnickoMeter1 from "./SnickoMeter1"; // Adjust path as needed

// ========== Helper Functions ===========
const waitForGlobal = (prop, timeout = 10000) =>
  new Promise((resolve, reject) => {
    let elapsed = 0;
    const interval = setInterval(() => {
      if (window[prop]) {
        clearInterval(interval);
        resolve();
      } else if ((elapsed += 100) >= timeout) {
        clearInterval(interval);
        reject(new Error(`Global variable ${prop} not loaded`));
      }
    }, 100);
  });

const COLORS = {
  batter: "blue",
  bowler: "red",
  person: "lime",
  ball: "orange",
  skeleton: "#FFD700",
  highlight: "cyan",
  pitch: "#4b3d28",
  wrist: "gold",
  joint: "yellow"
};

const SKELETON_CONNECTIONS = [
  ["left_shoulder", "right_shoulder"], ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"], ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"], ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"], ["left_hip", "right_hip"],
  ["left_hip", "left_knee"], ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"], ["right_knee", "right_ankle"]
];

function getAngle(A, B, C) {
  if (!(A && B && C)) return null;
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };
  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);
  if (magAB === 0 || magCB === 0) return null;
  const angle = Math.acos(Math.min(Math.max(dot / (magAB * magCB), -1), 1));
  return angle * 180 / Math.PI;
}
function calculateCenterOfMass(keypoints) {
  const valid = keypoints.filter(kp => kp.score > 0.4);
  if (!valid.length) return null;
  const sum = valid.reduce((a, kp) => ({
    x: a.x + kp.x,
    y: a.y + kp.y
  }), { x: 0, y: 0 });
  return { x: sum.x / valid.length, y: sum.y / valid.length };
}
function getDistance(A, B) {
  if (!A || !B) return null;
  return Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2);
}
function getHipAngle(leftHip, leftKnee, rightHip) {
  if (!leftHip || !leftKnee || !rightHip) return null;
  return getAngle(leftHip, leftKnee, rightHip);
}
function getTorsoLean(leftShoulder, rightShoulder) {
  if (!leftShoulder || !rightShoulder) return null;
  const dx = leftShoulder.x - rightShoulder.x;
  const dy = leftShoulder.y - rightShoulder.y;
  return Math.atan2(dy, dx) * 180 / Math.PI;
}
function getRoleConfidence(pose, batter, bowler) {
  if (!batter || !bowler || !(pose.keypoints && pose.keypoints.length)) return null;
  const cntr = pose.keypoints[0];
  const dist = obj =>
    Math.abs(cntr.x - (obj.bbox[0] + obj.bbox[2] / 2)) +
    Math.abs(cntr.y - (obj.bbox[1] + obj.bbox[3] / 2));
  const dBatter = dist(batter);
  const dBowler = dist(bowler);
  const sum = dBatter + dBowler || 1e-3;
  return {
    batter: 1 - dBatter / sum,
    bowler: 1 - dBowler / sum
  };
}
function assessCricketPose(pose, role = "batter", options = {}) {
  if (!pose || !pose.keypoints) return { status: "Unknown", role };
  const key = name =>
    pose.keypoints.find(kp => kp.name === name && kp.score > 0.4);
  const leftShoulder = key("left_shoulder");
  const leftElbow = key("left_elbow");
  const leftWrist = key("left_wrist");
  const rightShoulder = key("right_shoulder");
  const rightElbow = key("right_elbow");
  const rightWrist = key("right_wrist");
  const leftHip = key("left_hip");
  const leftKnee = key("left_knee");
  const leftAnkle = key("left_ankle");
  const rightHip = key("right_hip");
  const rightKnee = key("right_knee");
  const rightAnkle = key("right_ankle");
  const armAngle = role === "batter"
    ? getAngle(leftShoulder, leftElbow, leftWrist)
    : getAngle(rightShoulder, rightElbow, rightWrist);
  const kneeAngle = role === "batter"
    ? getAngle(leftHip, leftKnee, leftAnkle)
    : getAngle(rightHip, rightKnee, rightAnkle);
  const hipAngle = getHipAngle(leftHip, leftKnee, rightHip);
  const torsoLean = getTorsoLean(leftShoulder, rightShoulder);
  const strideLength = getDistance(leftAnkle, rightAnkle);
  const jointScores = {
    leftShoulder: leftShoulder?.score,
    leftElbow: leftElbow?.score,
    leftWrist: leftWrist?.score,
    rightShoulder: rightShoulder?.score,
    rightElbow: rightElbow?.score,
    rightWrist: rightWrist?.score,
    leftHip: leftHip?.score,
    leftKnee: leftKnee?.score,
    leftAnkle: leftAnkle?.score,
    rightHip: rightHip?.score,
    rightKnee: rightKnee?.score,
    rightAnkle: rightAnkle?.score
  };
  const centerOfMass = calculateCenterOfMass(pose.keypoints);
  let status = "Cannot determine posture";
  let pass = false;
  if (
    role === "batter" &&
    leftShoulder && leftElbow && leftWrist &&
    leftHip && leftKnee && leftAnkle
  ) {
    if (armAngle > 60 && armAngle < 130 && kneeAngle > 120 && kneeAngle < 175) {
      status = "Good batting pose";
      pass = true;
    } else {
      status = "Bad batting pose";
      pass = false;
    }
  }
  else if (
    role === "bowler" &&
    rightShoulder && rightElbow && rightWrist &&
    rightHip && rightKnee && rightAnkle
  ) {
    if (armAngle < 160 && kneeAngle > 120) {
      status = "Good bowling pose";
      pass = true;
    } else {
      status = "Bad bowling pose";
      pass = false;
    }
  }
  const roleConfidence =
    options.batter && options.bowler
      ? getRoleConfidence(pose, options.batter, options.bowler)
      : null;
  const timestamp = options.video?.currentTime ?? null;
  return {
    status,
    pass,
    armAngle,
    kneeAngle,
    hipAngle,
    torsoLean,
    strideLength,
    centerOfMass,
    jointScores,
    role,
    keypoints: pose.keypoints,
    roleConfidence,
    timestamp
  };
}

// ---- The X-Ray Effect ----
function applyXRayEffect(canvas) {
  if (!window.cv) return;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let src = window.cv.matFromImageData(imageData);
  let gray = new window.cv.Mat();
  let inv = new window.cv.Mat();
  // Convert to grayscale
  window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0);
  // Invert grayscale image
  window.cv.bitwise_not(gray, inv);
  // Convert back to rgba
  window.cv.cvtColor(inv, src, window.cv.COLOR_GRAY2RGBA, 0);
  const xrayImage = new ImageData(
    new Uint8ClampedArray(src.data), src.cols, src.rows
  );
  ctx.putImageData(xrayImage, 0, 0);
  src.delete(); gray.delete(); inv.delete();
}

// ========== Main Component ===========
export default function CricketAnalyzer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [log, setLog] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [frameInfo, setFrameInfo] = useState({});
  const [models, setModels] = useState({ objectModel: null, poseDetector: null });
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [filename, setFilename] = useState("");
  const [xrayEnabled, setXrayEnabled] = useState(false);

  const logMessage = msg =>
    setLog(prev => [...prev.slice(-100), msg]) && console.log(msg);

  useEffect(() => {
    const loadAllGlobals = async () => {
      await Promise.all([
        waitForGlobal("tf"),
        waitForGlobal("poseDetection"),
        waitForGlobal("cocoSsd"),
        waitForGlobal("cv")
      ]);
    };
    loadAllGlobals();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const preloadModels = async () => {
    if (models.objectModel && models.poseDetector) return models;
    const objectModel = await window.cocoSsd.load();
    const poseDetector = await window.poseDetection.createDetector(
      window.poseDetection.SupportedModels.MoveNet
    );
    setModels({ objectModel, poseDetector });
    return { objectModel, poseDetector };
  };

  const processVideo = (video, { objectModel, poseDetector }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (video.paused || video.ended) {
        setIsProcessing(false);
        clearInterval(intervalRef.current);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // X-Ray mode visual effect
      if (xrayEnabled) {
        applyXRayEffect(canvas);
      }

      let predictions = [];
      try {
        predictions = await objectModel.detect(canvas);
      } catch (err) {}
      const ballObjs = predictions.filter(o => o.class === "sports ball");
      const personObjs = predictions.filter(o => o.class === "person");

      predictions.forEach(obj => {
        ctx.strokeStyle = COLORS.person;
        ctx.lineWidth = 2;
        ctx.strokeRect(...obj.bbox);
        ctx.font = "15px Arial";
        ctx.fillStyle = COLORS.person;
        ctx.fillText(obj.class, obj.bbox[0], obj.bbox[1] - 5);
      });
      if (ballObjs.length) {
        const [x, y, w, h] = ballObjs[0].bbox;
        ctx.strokeStyle = COLORS.ball;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = COLORS.ball;
        ctx.fillText("BALL", x, y - 6);
      }

      let batter, bowler;
      if (personObjs.length >= 2) {
        const ordered = [...personObjs].sort(
          (a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3])
        );
        bowler = ordered[0];
        batter = ordered[ordered.length - 1];
        ctx.strokeStyle = COLORS.bowler;
        ctx.strokeRect(...bowler.bbox);
        ctx.font = "16px Arial";
        ctx.fillStyle = COLORS.bowler;
        ctx.fillText("BOWLER", bowler.bbox[0], bowler.bbox[1] - 18);
        ctx.strokeStyle = COLORS.batter;
        ctx.strokeRect(...batter.bbox);
        ctx.fillStyle = COLORS.batter;
        ctx.fillText("BATTER", batter.bbox[0], batter.bbox[1] - 18);
      }
      let poses = [];
      try {
        poses = await poseDetector.estimatePoses(video);
      } catch (err) {}
      poses.forEach(pose => {
        SKELETON_CONNECTIONS.forEach(([a, b]) => {
          const kpA = pose.keypoints.find(
            kp => kp.name === a && kp.score > 0.4
          );
          const kpB = pose.keypoints.find(
            kp => kp.name === b && kp.score > 0.4
          );
          if (kpA && kpB) {
            ctx.beginPath();
            ctx.moveTo(kpA.x, kpA.y);
            ctx.lineTo(kpB.x, kpB.y);
            ctx.strokeStyle = COLORS.skeleton;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
        pose.keypoints.forEach(kp => {
          if (kp.score > 0.4) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = COLORS.joint;
            ctx.fill();
          }
        });
        let role = "unknown";
        if (personObjs.length >= 2 && batter && bowler) {
          const center = pose.keypoints[0];
          const dist = obj =>
            Math.abs(center.x - (obj.bbox[0] + obj.bbox[2] / 2)) +
            Math.abs(center.y - (obj.bbox[1] + obj.bbox[3] / 2));
          role = dist(bowler) < dist(batter) ? "bowler" : "batter";
        }
        const assessment = assessCricketPose(pose, role, { batter, bowler, video });
        if (role === "batter" || role === "bowler") {
          logMessage(
            `[${role.toUpperCase()} detected at ${(video.currentTime).toFixed(2)}s]`
          );
        }
        ctx.font = "bold 14px Arial";
        ctx.fillStyle =
          assessment.status && assessment.status.includes("Good")
            ? "green"
            : assessment.status && assessment.status.includes("Bad")
              ? "red"
              : "gray";
        const cntr = pose.keypoints[0] || { x: 40, y: 40 };
        ctx.fillText(assessment.status, cntr.x, cntr.y - 50);
      });
      setFrameInfo(prev => ({
        ...prev,
        [`frame_${video.currentTime.toFixed(2)}`]: {
          poses,
          ballObjs,
          personObjs
        }
      }));
    }, 100);
  };

  // --- UPDATED File Upload Handler for filename ---
  const handleVideoUpload = async event => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsProcessing(false);
    setLog([]);
    setFrameInfo({});
    setVideoLoaded(false);
    setFilename("");
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
    const file = event.target.files[0];
    if (!file) return;
    setFilename(file.name);
    const video = videoRef.current;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = async () => {
      video.currentTime = 0;
      let seekedResolve;
      const seekedPromise = new Promise(res => (seekedResolve = res));
      const seekedHandler = () => {
        video.removeEventListener("seeked", seekedHandler);
        seekedResolve();
      };
      video.addEventListener("seeked", seekedHandler);
      await seekedPromise;
      setVideoLoaded(true);
      const loadedModels = await preloadModels();
      await video.play();
      if (!isProcessing) {
        setIsProcessing(true);
        processVideo(video, loadedModels);
      }
    };
  };

  const handleReplayAnalyzer = async () => {
    if (!videoLoaded || !videoRef.current) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsProcessing(false);
    setLog([]);
    setFrameInfo({});
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    const video = videoRef.current;
    video.currentTime = 0;
    await new Promise(res => {
      const handler = () => {
        video.removeEventListener("seeked", handler);
        res();
      };
      video.addEventListener("seeked", handler);
    });
    const loadedModels = await preloadModels();
    await video.play();
    if (!isProcessing) {
      setIsProcessing(true);
      processVideo(video, loadedModels);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handlePlay = async () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (videoLoaded && models.objectModel && models.poseDetector) {
        setIsProcessing(true);
        processVideo(video, models);
      }
    };
    const handlePause = () => {
      setIsProcessing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoLoaded, models.objectModel, models.poseDetector, xrayEnabled]);

  return (
    <div>
      <h2>Click Replay to Play & Select X-ray then Double Click Replay</h2>
      <div className="snicko-controls-row" style={{ marginBottom: 12 }}>
        <label className="custom-file-upload">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: "none" }}
          />
          Choose File
        </label>
        {filename && (
          <span className="video-filename" style={{ marginLeft: 8 }}>{filename}</span>
        )}
        {videoLoaded && (
          <>
            <button
              className="replay-analyzer-btn"
              onClick={handleReplayAnalyzer}
              disabled={!videoLoaded}
              style={{ marginLeft: 12 }}
            >
              Replay Analyzer
            </button>
            <button
              style={{
                marginLeft: 12,
                background: xrayEnabled ? "#333" : "#fff",
                color: xrayEnabled ? "#fff" : "#000",
                border: "1px solid #aaa",
                borderRadius: 4,
                padding: "6px 12px"
              }}
              onClick={() => setXrayEnabled(x => !x)}
            >
              {xrayEnabled ? "Disable" : "Enable"} X-Ray View
            </button>
          </>
        )}
      </div>
      <div
        className="snicker-stack-wrap"
        style={{
          position: "relative",
          display: "inline-block",
          maxWidth: 640
        }}
      >
        <video
          className="snicko-video"
          ref={videoRef}
          controls
          style={{
            width: 640,
            height: 480,
            display: "block",
            position: "relative",
            background: "#000"
          }}
        />
        <canvas
          className="snicko-canvas"
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none"
          }}
        />
      </div>
      <div className="snicko-log-section">
        <h3 style={{ marginBottom: 12 }}>Result Log</h3>
        <div
          className="snicko-log"
          style={{
            minHeight: 120,
            maxHeight: 320,
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: 14
          }}
        >
          {log.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
