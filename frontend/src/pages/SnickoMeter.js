import { useRef, useEffect, useState } from "react";

// Helper functions/constants
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

// Helper to compute angle between three points
function getAngle(A, B, C) {
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };
  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);
  if (magAB === 0 || magCB === 0) return 0;
  const angle = Math.acos(Math.min(Math.max(dot / (magAB * magCB), -1), 1));
  return angle * 180 / Math.PI;
}

// Pose quality assessment (basic rules, refine as needed)
function assessCricketPose(pose, role = "batter") {
  if (!pose || !pose.keypoints) return "Unknown";
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

  // Example Batting Pose: left arm (for right-handed) ~90 deg, knees slightly bent
  if (role === "batter" && leftShoulder && leftElbow && leftWrist && leftHip && leftKnee) {
    const armAngle = getAngle(leftShoulder, leftElbow, leftWrist);
    const kneeAngle = getAngle(leftHip, leftKnee, leftAnkle);
    if (armAngle > 60 && armAngle < 130 && kneeAngle > 120 && kneeAngle < 175)
      return "Good batting pose";
    else
      return "Bad batting pose";
  }
  // Example Bowling Pose: right arm nearly straight, knee not locked
  if (role === "bowler" && rightShoulder && rightElbow && rightWrist && rightHip && rightKnee) {
    const armAngle = getAngle(rightShoulder, rightElbow, rightWrist);
    const kneeAngle = getAngle(rightHip, rightKnee, rightAnkle);
    if (armAngle < 160 && kneeAngle > 120)
      return "Good bowling pose";
    else
      return "Bad bowling pose";
  }
  return "Cannot determine posture";
}

export default function CricketAnalyzer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [log, setLog] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [frameInfo, setFrameInfo] = useState({});

  // Logging
  const logMessage = msg =>
    setLog(prev => [...prev.slice(-50), msg]) && console.log(msg);

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          waitForGlobal("tf"),
          waitForGlobal("poseDetection"),
          waitForGlobal("cocoSsd"),
          waitForGlobal("cv")
        ]);
        logMessage("All models and libraries loaded.");
      } catch (err) {
        logMessage(`Error loading libraries: ${err.message}`);
      }
    };
    loadModels();
  }, []);

  // Main video analysis loop
  const processVideo = async video => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let objectModel, poseDetector;
    try {
      objectModel = await window.cocoSsd.load();
      poseDetector = await window.poseDetection.createDetector(
        window.poseDetection.SupportedModels.MoveNet
      );
    } catch (err) {
      logMessage(`Error loading TF models: ${err.message}`);
      return;
    }

    intervalRef.current = setInterval(async () => {
      if (video.paused || video.ended) {
        clearInterval(intervalRef.current);
        setIsProcessing(false);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Object detection
      let predictions = [];
      try {
        predictions = await objectModel.detect(canvas);
      } catch (err) {
        logMessage("Object Detection Error: " + err.message);
      }

      const ballObjs = predictions.filter(o => o.class === "sports ball");
      const personObjs = predictions.filter(o => o.class === "person");

      // Draw regions of interest
      predictions.forEach(obj => {
        ctx.strokeStyle = COLORS.person;
        ctx.lineWidth = 2;
        ctx.strokeRect(...obj.bbox);
        ctx.font = "15px Arial";
        ctx.fillStyle = COLORS.person;
        ctx.fillText(obj.class, obj.bbox[0], obj.bbox[1] - 5);
      });
      // Ball highlight
      if (ballObjs.length) {
        const [x, y, w, h] = ballObjs[0].bbox;
        ctx.strokeStyle = COLORS.ball;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = COLORS.ball;
        ctx.fillText("BALL", x, y - 6);
      }

      // Role assignment by leftmost/rightmost
      let batter, bowler;
      if (personObjs.length >= 2) {
        const ordered = [...personObjs].sort((a, b) => a.bbox[0] - b.bbox[0]);
        batter = ordered[0];
        bowler = ordered[ordered.length - 1];
        ctx.strokeStyle = COLORS.batter;
        ctx.strokeRect(...batter.bbox);
        ctx.font = "16px Arial";
        ctx.fillStyle = COLORS.batter;
        ctx.fillText("BATTER", batter.bbox[0], batter.bbox[1] - 18);
        ctx.strokeStyle = COLORS.bowler;
        ctx.strokeRect(...bowler.bbox);
        ctx.fillStyle = COLORS.bowler;
        ctx.fillText("BOWLER", bowler.bbox[0], bowler.bbox[1] - 18);
      }

      // Pose estimation and skeleton feedback
      let poses = [];
      try {
        poses = await poseDetector.estimatePoses(video);
      } catch (err) {
        logMessage("Pose Detection Error: " + err.message);
      }

      poses.forEach((pose, idx) => {
        // Draw skeleton lines & dots
        SKELETON_CONNECTIONS.forEach(([a, b]) => {
          const kpA = pose.keypoints.find(kp => kp.name === a && kp.score > 0.4);
          const kpB = pose.keypoints.find(kp => kp.name === b && kp.score > 0.4);
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

        // Role association by bbox proximity
        let role = "unknown";
        if (personObjs.length >= 2) {
          const center = pose.keypoints[0];
          // finds distance to leftmost/rightmost bbox
          const dist = obj =>
            Math.abs(center.x - (obj.bbox[0] + obj.bbox[2] / 2)) +
            Math.abs(center.y - (obj.bbox[1] + obj.bbox[3] / 2));
          role = dist(batter) < dist(bowler) ? "batter" : "bowler";
        }

        // Real-time AI/Rule-based pose quality
        const poseQuality = assessCricketPose(pose, role);
        ctx.font = "bold 14px Arial";
        ctx.fillStyle =
          poseQuality && poseQuality.includes("Good") ? "green" :
          poseQuality && poseQuality.includes("Bad") ? "red" : "gray";
        const cntr = pose.keypoints[0] || { x: 40, y: 40 };
        ctx.fillText(poseQuality, cntr.x, cntr.y - 50);
      });

      // Aggregation for further analysis or visualization
      setFrameInfo(prev => ({
        ...prev,
        [`frame_${video.currentTime.toFixed(2)}`]: {
          poses,
          ballObjs,
          personObjs
        }
      }));

      if (poses.length) logMessage(`Detected ${poses.length} human poses at ${video.currentTime.toFixed(2)}s`);
      if (!ballObjs.length) logMessage(`No ball detected at ${video.currentTime.toFixed(2)}s`);
    }, 100);
  };

  // Upload/reset handler
  const handleVideoUpload = async event => {
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
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
    const file = event.target.files[0];
    if (!file) return;
    const video = videoRef.current;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = async () => {
      await video.play();
      if (!isProcessing) {
        setIsProcessing(true);
        processVideo(video);
      }
    };
  };

  return (
    <div>
      <h2>Cricket Analyzer (Biomechanics & Pose Quality Checker)</h2>
      <div className="snicko-row" style={{ display: "flex" }}>
        <div className="snicko-upload">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ marginBottom: 12 }}
          />
          <video
            className="snicko-video"
            ref={videoRef}
            controls
            style={{ marginBottom: 12, maxWidth: 400 }}
          />
        </div>
        <div className="snicko-canvas-wrap">
          <canvas
            className="snicko-canvas"
            ref={canvasRef}
            width={640}
            height={480}
          />
        </div>
      </div>
      <div className="snicko-log-section">
        <h3 style={{ marginBottom: 12 }}>Result Log</h3>
        <div
          className="snicko-log"
          style={{ minHeight: 120, maxHeight: 320, overflowY: "auto" }}
        >
          {log.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
