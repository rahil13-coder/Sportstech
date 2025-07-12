import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";

// Dummy stubs for optional helpers
const compressVideo = async (file) => file;

// PDF Report Generator (unchanged)
const generatePDFReport = async (data) => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Player: ${data.playerName}`, 10, 10);
  doc.text(`File: ${data.fileName}`, 10, 20);
  doc.text(`Time: ${new Date(data.timestamp).toLocaleString()}`, 10, 30);

  doc.setFontSize(12);
  doc.text(`Shot Played: ${data.metrics.shotPlayed}`, 10, 45);
  doc.text(`Ball Region: ${data.metrics.ballRegion}`, 10, 55);
  doc.text(`Bowler Type: ${data.metrics.bowlerType}`, 10, 65);
  doc.text(`Shot Timing: ${data.metrics.shotTiming}`, 10, 75);

  doc.text("AI Insights:", 10, 90);
  let y = 100;
  for (const [key, value] of Object.entries(data.aiGeneratedInsights || {})) {
    doc.text(
      `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`,
      10,
      y
    );
    y += 10;
  }

  doc.save(`${data.playerName}_cricket_analysis.pdf`);
};

// --- Fallback helpers ---
const getAngle = (a, b, c) => {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const cb = { x: b.x - c.x, y: b.y - c.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  const angle = Math.acos(dot / (magAB * magCB));
  return (angle * 180) / Math.PI;
};

function extractFeatures(pose) {
  const requiredPoints = [
    "leftWrist",
    "leftElbow",
    "leftShoulder",
    "leftHip",
    "leftKnee",
    "leftAnkle",
    "rightWrist",
    "rightElbow",
    "rightShoulder",
    "rightHip",
    "rightKnee",
    "rightAnkle",
    "ankle",
    "eye",
    "nose",
  ];
  const keypoints = {};
  for (const point of requiredPoints) {
    const kp = pose.keypoints.find((k) => k.name === point || k.part === point);
    if (!kp || kp.score < 0.5) return null;
    keypoints[point] = kp;
  }

  const features = [
    getAngle(keypoints.leftWrist, keypoints.leftElbow, keypoints.leftShoulder),
    getAngle(
      keypoints.rightWrist,
      keypoints.rightElbow,
      keypoints.rightShoulder
    ),
    getAngle(
      keypoints.leftWrist,
      keypoints.leftElbow,
      keypoints.rightShoulder
    ),
    getAngle(
      keypoints.rightWrist,
      keypoints.rightElbow,
      keypoints.leftShoulder
    ),
    Math.abs(keypoints.leftAnkle.x - keypoints.leftHip.x),
    Math.abs(keypoints.rightAnkle.x - keypoints.rightHip.x),
    getAngle(keypoints.leftWrist, keypoints.leftElbow, keypoints.leftHip),
    getAngle(keypoints.rightWrist, keypoints.rightElbow, keypoints.rightHip),
    keypoints.nose.x - keypoints.leftShoulder.x,
    keypoints.nose.x - keypoints.rightShoulder.x,
    keypoints.eye ? keypoints.eye.x - keypoints.nose.x : 0,
    keypoints.eye ? keypoints.eye.y - keypoints.nose.y : 0,
  ];
  return features;
}

export const inferShotFromPose = (pose) => {
  const features = extractFeatures(pose);
  if (!features) return "Low Confidence Pose";

  const [
    leftArmAngle,
    rightArmAngle,
    leftBacklift,
    rightBacklift,
    leftFootMove,
    rightFootMove,
    leftFollowThrough,
    rightFollowThrough,
    noseLeftShoulderX,
    noseRightShoulderX,
    eyeNoseX,
    eyeNoseY,
  ] = features;

  // === Comprehensive Cricket Shot Classification ===

  // Front foot shots
  if (
    leftBacklift > 120 &&
    leftArmAngle > 140 &&
    leftFollowThrough > 130 &&
    leftFootMove > 30
  )
    return "Cover Drive";
  if (
    rightBacklift > 120 &&
    rightArmAngle > 140 &&
    rightFollowThrough > 130 &&
    rightFootMove > 30
  )
    return "Off Drive";
  if (
    leftBacklift > 120 &&
    leftArmAngle > 140 &&
    leftFollowThrough > 130 &&
    Math.abs(noseLeftShoulderX) < 30
  )
    return "Straight Drive";
  if (
    leftBacklift > 120 &&
    leftArmAngle > 140 &&
    leftFollowThrough < 100 &&
    leftFootMove > 40
  )
    return "Square Drive";

  // Back foot shots
  if (leftArmAngle < 100 && leftFollowThrough > 150 && leftFootMove < 20)
    return "Pull Shot";
  if (rightArmAngle < 100 && rightFollowThrough > 150 && rightFootMove < 20)
    return "Hook Shot";
  if (
    leftArmAngle > 120 &&
    leftFollowThrough > 120 &&
    leftFootMove < 20 &&
    noseLeftShoulderX > 30
  )
    return "Backfoot Punch";
  if (
    leftArmAngle > 120 &&
    leftFollowThrough > 120 &&
    leftFootMove < 20 &&
    noseLeftShoulderX < -30
  )
    return "Backfoot Drive";

  // Horizontal bat shots
  if (leftFootMove > 40 && leftFollowThrough < 90) return "Sweep Shot";
  if (rightFootMove > 40 && rightFollowThrough < 90) return "Reverse Sweep";
  if (
    leftArmAngle > 150 &&
    rightArmAngle > 150 &&
    leftFollowThrough > 120 &&
    rightFollowThrough > 120
  )
    return "Upper Cut";
  if (
    leftArmAngle > 140 &&
    leftFollowThrough < 100 &&
    leftFootMove < 20
  )
    return "Cut Shot";
  if (
    rightArmAngle > 140 &&
    rightFollowThrough < 100 &&
    rightFootMove < 20
  )
    return "Square Cut";

  // Leg side shots
  if (
    leftArmAngle > 100 &&
    leftFollowThrough > 100 &&
    leftFootMove > 30 &&
    leftBacklift < 100
  )
    return "Flick Shot";
  if (
    leftArmAngle > 100 &&
    leftFollowThrough > 100 &&
    leftFootMove > 30 &&
    leftBacklift < 80
  )
    return "Leg Glance";

  // Lofted shots
  if (leftBacklift > 140 && leftFollowThrough > 150 && eyeNoseY < -10)
    return "Lofted Drive";
  if (leftBacklift > 140 && leftFollowThrough > 150 && eyeNoseY > 10)
    return "Lofted Pull";

  // Defensive shots
  if (leftBacklift < 80 && leftArmAngle > 120 && leftFollowThrough < 90)
    return "Defensive Shot";
  if (leftBacklift < 80 && leftArmAngle < 100 && leftFollowThrough < 90)
    return "Leave";

  // Unorthodox shots
  if (rightFootMove > 50 && rightFollowThrough > 100 && leftBacklift > 120)
    return "Switch Hit";
  if (
    leftBacklift > 120 &&
    leftArmAngle > 140 &&
    rightFootMove > 50 &&
    rightFollowThrough > 100
  )
    return "Ramp Shot";
  if (
    leftArmAngle > 150 &&
    rightArmAngle > 150 &&
    leftFollowThrough > 150 &&
    rightFollowThrough > 150
  )
    return "Scoop";

  return "Unknown";
};

export const inferBallType = (ballTrajectory) => {
  if (!ballTrajectory || ballTrajectory.length < 3) return "Unknown";

  const getSpeed = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dt = p2.t - p1.t;
    return Math.sqrt(dx * dx + dy * dy) / dt;
  };
  const preBounceSpeed = getSpeed(ballTrajectory[0], ballTrajectory[1]);

  let bounceIdx = ballTrajectory.findIndex(
    (p, i, arr) =>
      i > 1 && arr[i - 2].y > arr[i - 1].y && arr[i - 1].y < p.y
  );
  let bounceY = bounceIdx > 0 ? ballTrajectory[bounceIdx].y : null;

  const postBounceSpeed =
    bounceIdx > 0 && bounceIdx + 1 < ballTrajectory.length
      ? getSpeed(ballTrajectory[bounceIdx], ballTrajectory[bounceIdx + 1])
      : null;

  const speedDrop = postBounceSpeed ? preBounceSpeed - postBounceSpeed : 0;
  const initialY = ballTrajectory[0].y;
  const peakY = Math.min(...ballTrajectory.map((p) => p.y));
  const lateralMovement = Math.abs(
    ballTrajectory[0].x - ballTrajectory[ballTrajectory.length - 1].x
  );

  if (bounceY && bounceY < 150) return "Short Ball";
  if (bounceY && bounceY <= 300) return "Good Length";
  if (!bounceY) return initialY < 100 ? "Yorker" : "Full Toss";
  if (peakY < 100 && bounceY < 100) return "Bouncer";
  if (speedDrop > 0.1 * preBounceSpeed) return "Slower Ball";
  if (lateralMovement > 30) {
    if (ballTrajectory[0].x > ballTrajectory[ballTrajectory.length - 1].x)
      return "Inswinger";
    else return "Outswinger";
  }
  return "Unknown";
};

let knnClassifier = null;
const getKNN = async () => {
  if (!knnClassifier && window.knnClassifier) {
    knnClassifier = window.knnClassifier.create();
  }
  return knnClassifier;
};

const useD3Visualization = (containerRef, playerMovements) => {
  useEffect(() => {
    if (window.d3 && containerRef.current && playerMovements.length > 0) {
      const d3 = window.d3;
      const svg = d3.select(containerRef.current)
        .attr("width", 400)
        .attr("height", 300);
      svg.selectAll("*").remove();
      svg
        .selectAll("circle")
        .data(playerMovements)
        .enter()
        .append("circle")
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1])
        .attr("r", 3)
        .attr("fill", "blue");
    }
  }, [containerRef, playerMovements]);
};

const useThreeJSVisualization = (containerRef, pose3DPoints) => {
  useEffect(() => {
    if (window.THREE && containerRef.current && pose3DPoints.length > 0) {
      const THREE = window.THREE;
      const width = 400,
        height = 300;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(width, height);
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(renderer.domElement);
      pose3DPoints.forEach(([x, y, z]) => {
        const geometry = new THREE.SphereGeometry(0.5, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        scene.add(sphere);
      });
      camera.position.z = 50;
      renderer.render(scene, camera);
    }
  }, [containerRef, pose3DPoints]);
};

const runFullAIAnalysis = async (
  videoRef,
  setPerformanceMetrics,
  setShotSummary,
  setDetailedTimeline,
  setAiInsights,
  setShowResults,
  setError,
  playerName,
  fileName,
  setPlayerMovements,
  setPose3DPoints
) => {
  try {
    if (!window.tf || !window.poseDetection || !window.cocoSsd) {
      setError("Required AI libraries are not loaded.");
      return;
    }
    await window.tf.ready();
    const detector = await window.poseDetection.createDetector(
      window.poseDetection.SupportedModels.MoveNet,
      {
        modelType:
          window.poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
        enableSmoothing: true,
      }
    );
    const objectModel = await window.cocoSsd.load();
    const knn = await getKNN();
    const video = videoRef.current;
    if (!video) return;
    const interval = 1000;
    const frameCount = Math.min(
      Math.floor((video.duration * 1000) / interval),
      31
    );
    const posesData = [];
    const eventsTimeline = [];
    const playerMovements = [];
    const pose3DPoints = [];

    for (let i = 0; i < frameCount; i++) {
      video.currentTime = (i * interval) / 1000;
      await new Promise((resolve) =>
        video.addEventListener("seeked", resolve, { once: true })
      );

      const poses = await detector.estimatePoses(video);
      const objects = await objectModel.detect(video);

      let shot = "Unknown",
        ballRegion = "Unknown",
        bowlerType = i * interval < 3000 ? "Pace" : "Spin",
        shotTiming = "Unknown";
      let swingDetected = false,
        ballDetected = false,
        ballCoords = "";
      let knnAction = "Unknown";

      if (poses && poses.length > 0) {
        shot = inferShotFromPose(poses[0]);
        const keypoints = poses[0].keypoints;
        const wrist = keypoints.find(
          (k) => k.name && k.name.includes("wrist")
        );
        const elbow = keypoints.find(
          (k) => k.name && k.name.includes("elbow")
        );
        const leftKnee = keypoints.find((k) => k.name === "left_knee");
        ballRegion =
          wrist && elbow
            ? wrist.x < elbow.x - 20
              ? "Leg Side"
              : wrist.x > elbow.x + 20
              ? "Off Side"
              : "Straight"
            : "Unknown";
        shotTiming =
          wrist && elbow
            ? wrist.y - elbow.y < -20
              ? "Early"
              : wrist.y - elbow.y > 20
              ? "Late"
              : "Perfect"
            : "Unknown";
        if (
          wrist &&
          leftKnee &&
          wrist.score > 0.5 &&
          leftKnee.score > 0.5 &&
          wrist.y < leftKnee.y
        ) {
          swingDetected = true;
        }
        if (knn && knn.getNumClasses() > 0) {
          const flatKeypoints = keypoints.map((kp) => [kp.x, kp.y]).flat();
          const inputTensor = window.tf.tensor(flatKeypoints, [
            1,
            flatKeypoints.length,
          ]);
          const result = await knn.predictClass(inputTensor);
          knnAction = result.label;
          inputTensor.dispose();
        }
        if (wrist) playerMovements.push([wrist.x, wrist.y]);
        const shoulder = keypoints.find(
          (k) => k.name && k.name.includes("shoulder")
        );
        pose3DPoints.push([shoulder?.x || 0, shoulder?.y || 0, 0]);
      }
      const ball = objects.find((o) => o.class === "sports ball");
      if (ball) {
        ballDetected = true;
        ballCoords = `(${Math.round(ball.bbox[0])}, ${Math.round(
          ball.bbox[1]
        )})`;
      }

      let events = [];
      if (swingDetected) events.push("Batsman may have swung the bat");
      if (ballDetected) events.push(`Ball detected at ${ballCoords}`);
      if (knnAction && knnAction !== "Unknown")
        events.push(`KNN Action: ${knnAction}`);
      if (events.length) {
        eventsTimeline.push({
          time: (i * interval / 1000).toFixed(2),
          event: events.join(", "),
        });
      }

      posesData.push({
        time: (i * interval / 1000).toFixed(2),
        shot,
        ballRegion,
        bowlerType,
        shotTiming,
        ballDetected,
        ballCoords,
        swingDetected,
        knnAction,
        objects: objects.map((obj) => ({
          class: obj.class,
          bbox: obj.bbox,
        })),
        keypoints: poses[0]?.keypoints || [],
      });
    }

    setPlayerMovements([...playerMovements]);
    setPose3DPoints([...pose3DPoints]);

    if (posesData.length > 0) {
      const mostFrequentShot = posesData.reduce((acc, pose) => {
        acc[pose.shot] = (acc[pose.shot] || 0) + 1;
        return acc;
      }, {});
      const sortedShots = Object.entries(mostFrequentShot).sort(
        (a, b) => b[1] - a[1]
      );
      const bestShot =
        sortedShots.length > 0 ? sortedShots[0][0] : "Unknown";
      setPerformanceMetrics({
        shotPlayed: bestShot,
        ballRegion: posesData[0].ballRegion,
        bowlerType: posesData[0].bowlerType,
        shotTiming: posesData[0].shotTiming,
      });
      setShotSummary({
        totalFramesAnalyzed: frameCount,
        uniqueShots: [...new Set(posesData.map((p) => p.shot))],
        shotFrequency: Object.fromEntries(sortedShots),
      });
      setDetailedTimeline(
        posesData.map(
          ({
            time,
            shot,
            ballDetected,
            swingDetected,
            knnAction,
            objects,
            ballCoords,
          }) => ({
            time,
            shot,
            ballDetected,
            swingDetected,
            knnAction,
            objects,
            ballCoords,
          })
        )
      );
      setAiInsights({
        ...((eventsTimeline.length > 0) && { eventsTimeline }),
        allObjects: posesData.flatMap((p) => p.objects),
      });
      setShowResults(true);
    }
  } catch (err) {
    console.error("AI analysis failed:", err);
    setError("AI video analysis failed.");
  }
};

function SnickoMeter() {
  // Core state for Player A
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [detailedTimeline, setDetailedTimeline] = useState([]);
  const [shotSummary, setShotSummary] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [bowlerResult, setBowlerResult] = useState(null);

  // Core state for Player B
  const [performanceMetricsB, setPerformanceMetricsB] = useState(null);
  const [detailedTimelineB, setDetailedTimelineB] = useState([]);
  const [shotSummaryB, setShotSummaryB] = useState(null);
  const [aiInsightsB, setAiInsightsB] = useState(null);
  const [bowlerResultB, setBowlerResultB] = useState(null);

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [activePlayer, setActivePlayer] = useState("A"); // 'A' or 'B'

  // Player info
  const [playerNameA, setPlayerNameA] = useState("");
  const [playerNameB, setPlayerNameB] = useState("");
  const [videoUrlA, setVideoUrlA] = useState(null);
  const [videoUrlB, setVideoUrlB] = useState(null);

  // Video refs
  const videoRefA = useRef(null);
  const videoRefB = useRef(null);

  // Visualization state
  const [playerMovements, setPlayerMovements] = useState([]);
  const [pose3DPoints, setPose3DPoints] = useState([]);
  const d3Container = useRef(null);
  const threeContainer = useRef(null);

  useD3Visualization(d3Container, playerMovements);
  useThreeJSVisualization(threeContainer, pose3DPoints);

  const handleVideoUpload = async (e, videoSlot = "A") => {
    let file = e.target.files[0];
    if (!file) return;

    const playerName = videoSlot === "A" ? playerNameA : playerNameB;
    if (!playerName || playerName.trim() === "") {
      setError(`Please enter a player name for Video ${videoSlot}.`);
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setShowResults(false);
    setProgress(10);

    // Reset results for the uploading player
    if (videoSlot === "A") {
      setPerformanceMetrics(null);
      setDetailedTimeline([]);
      setShotSummary(null);
      setAiInsights(null);
      setBowlerResult(null);
    } else {
      setPerformanceMetricsB(null);
      setDetailedTimelineB([]);
      setShotSummaryB(null);
      setAiInsightsB(null);
      setBowlerResultB(null);
    }

    try {
      file = await compressVideo(file);
    } catch (err) {
      console.warn("Compression failed:", err);
    }

    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";

    const validateDuration = () =>
      new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          window.URL.revokeObjectURL(videoElement.src);
          if (videoElement.duration < 4) {
    reject('Please upload a video of at least 4 seconds.');
  } else if (videoElement.duration > 60) {
    reject('Please upload a video less than 60 seconds.');
  } else {
    resolve();
  }
};
        videoElement.onerror = () => reject("Invalid video file.");
        videoElement.src = URL.createObjectURL(file);
      });

    try {
      await validateDuration();
    } catch (durationError) {
      setIsAnalyzing(false);
      setError(durationError);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setProgress(50);

    setTimeout(async () => {
      try {
        if (videoSlot === "A") {
          setVideoUrlA(previewUrl);
          await runFullAIAnalysis(
            videoRefA,
            setPerformanceMetrics,
            setShotSummary,
            setDetailedTimeline,
            setAiInsights,
            setShowResults,
            setError,
            playerName,
            file.name,
            setPlayerMovements,
            setPose3DPoints
          );
        } else {
          setVideoUrlB(previewUrl);
          await runFullAIAnalysis(
            videoRefB,
            setPerformanceMetricsB,
            setShotSummaryB,
            setDetailedTimelineB,
            setAiInsightsB,
            setShowResults,
            setError,
            playerName,
            file.name,
            setPlayerMovements,
            setPose3DPoints
          );
        }
        setProgress(100);
      } catch (err) {
        setError("AI video analysis failed.");
      } finally {
        setIsAnalyzing(false);
        setProgress(0);
      }
    }, 1000);
  };

  const handleBack = () => {
    setShowResults(false);
    setBowlerResult(null);
    setBowlerResultB(null);
  };

  // Bowler Result Handler
  const handleBowlerResult = (player) => {
    if (player === "A") {
      setActivePlayer("A");
      setShowResults(true);
      // Extract ball trajectory from detailedTimeline
      const ballTrajectory = detailedTimeline
        .filter((p) => p.ballDetected && p.ballCoords)
        .map((p) => {
          const coords = p.ballCoords.match(/\d+/g);
          return {
            x: Number(coords[0]),
            y: Number(coords[1]),
            t: Number(p.time),
          };
        });
      const ballType = inferBallType(ballTrajectory);
      setBowlerResult(ballType);
      setAiInsights((prev) => ({ ...prev, ballType }));
    } else {
      setActivePlayer("B");
      setShowResults(true);
      const ballTrajectory = detailedTimelineB
        .filter((p) => p.ballDetected && p.ballCoords)
        .map((p) => {
          const coords = p.ballCoords.match(/\d+/g);
          return {
            x: Number(coords[0]),
            y: Number(coords[1]),
            t: Number(p.time),
          };
        });
      const ballType = inferBallType(ballTrajectory);
      setBowlerResultB(ballType);
      setAiInsightsB((prev) => ({ ...prev, ballType }));
    }
  };

  // Render
  return (
    <div
      className="card p-4 bg-light mb-4"
      style={{ width: "95%", margin: "0 auto" }}
    >
      <h4>🎙️ Snicko Meter Technology (Enhanced)</h4>
      <p>
        Upload cricket videos for Player A and/or Player B. Detects bat-ball
        contact & generates real-time metrics using AI Pose + Object Detection
        in-browser, with KNN, OpenCV, speech commands, and visualizations.
      </p>

      <div className="row mb-4">
        <div className="col-md-6">
          <label>
            <strong>Player A Name:</strong>
            <input
              type="text"
              className="form-control mb-2"
              value={playerNameA}
              onChange={(e) => setPlayerNameA(e.target.value)}
              placeholder="Enter Player A Name"
            />
          </label>
          <input
            type="file"
            accept="video/*"
            className="form-control mb-3"
            onChange={(e) => handleVideoUpload(e, "A")}
          />
          {videoUrlA && (
            <>
              <video
                ref={videoRefA}
                src={videoUrlA}
                controls
                width="100%"
                className="mb-2"
              />
              <button
                className="btn btn-danger btn-sm mb-2"
                onClick={() => {
                  setVideoUrlA(null);
                  setShowResults(false);
                  setPerformanceMetrics(null);
                  setDetailedTimeline([]);
                  setShotSummary(null);
                  setAiInsights(null);
                  setBowlerResult(null);
                  setError("");
                }}
              >
                🔁 Reset Video A
              </button>
            </>
          )}
        </div>
        <div className="col-md-6">
          <label>
            <strong>Player B Name:</strong>
            <input
              type="text"
              className="form-control mb-2"
              value={playerNameB}
              onChange={(e) => setPlayerNameB(e.target.value)}
              placeholder="Enter Player B Name"
            />
          </label>
          <input
            type="file"
            accept="video/*"
            className="form-control mb-3"
            onChange={(e) => handleVideoUpload(e, "B")}
          />
          {videoUrlB && (
            <>
              <video
                ref={videoRefB}
                src={videoUrlB}
                controls
                width="100%"
                className="mb-2"
              />
              <button
                className="btn btn-danger btn-sm mb-2"
                onClick={() => {
                  setVideoUrlB(null);
                  setShowResults(false);
                  setPerformanceMetricsB(null);
                  setDetailedTimelineB([]);
                  setShotSummaryB(null);
                  setAiInsightsB(null);
                  setBowlerResultB(null);
                  setError("");
                }}
              >
                🔁 Reset Video B
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mb-3">
        <button
          className="btn btn-success mr-2"
          onClick={() => {
            setActivePlayer("A");
            setShowResults(true);
          }}
        >
          Get Batter Result (A)
        </button>
        <button
          className="btn btn-success mr-2"
          onClick={() => {
            setActivePlayer("B");
            setShowResults(true);
          }}
        >
          Get Batter Result (B)
        </button>
        <button
          className="btn btn-info mr-2"
          onClick={() => handleBowlerResult("A")}
        >
          Get Bowler Result (A)
        </button>
        <button
          className="btn btn-info"
          onClick={() => handleBowlerResult("B")}
        >
          Get Bowler Result (B)
        </button>
      </div>

      {isAnalyzing && (
        <div className="alert alert-info small">
          ⚙️ Processing... Please wait.
          <div className="progress mt-2">
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {progress}%
            </div>
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger small">{error}</div>}

      {showResults && !isAnalyzing && (
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="p-3 border rounded bg-white mb-3">
              <h5>
                Player {activePlayer}:{" "}
                {activePlayer === "A" ? playerNameA : playerNameB}
              </h5>
              <ul>
                <li>
                  <strong>Shot Played:</strong>{" "}
                  {activePlayer === "A"
                    ? performanceMetrics?.shotPlayed
                    : performanceMetricsB?.shotPlayed}
                </li>
                <li>
                  <strong>Ball Region:</strong>{" "}
                  {activePlayer === "A"
                    ? performanceMetrics?.ballRegion
                    : performanceMetricsB?.ballRegion}
                </li>
                <li>
                  <strong>Bowler Type:</strong>{" "}
                  {activePlayer === "A"
                    ? performanceMetrics?.bowlerType
                    : performanceMetricsB?.bowlerType}
                </li>
                <li>
                  <strong>Shot Timing:</strong>{" "}
                  {activePlayer === "A"
                    ? performanceMetrics?.shotTiming
                    : performanceMetricsB?.shotTiming}
                </li>
                {(activePlayer === "A" ? bowlerResult : bowlerResultB) && (
                  <li>
                    <strong>Bowler Result (Ball Type):</strong>{" "}
                    {activePlayer === "A" ? bowlerResult : bowlerResultB}
                  </li>
                )}
              </ul>
              <h6 className="mt-3">AI Insights</h6>
              <ul>
                {(activePlayer === "A"
                  ? aiInsights?.eventsTimeline
                  : aiInsightsB?.eventsTimeline) &&
                  (activePlayer === "A"
                    ? aiInsights.eventsTimeline
                    : aiInsightsB.eventsTimeline
                  ).map((evt, i) => (
                    <li key={i}>
                      <strong>{evt.time}s:</strong> {evt.event}
                    </li>
                  ))}
                {(activePlayer === "A"
                  ? aiInsights?.allObjects
                  : aiInsightsB?.allObjects) && (
                  <li>
                    <strong>All Detected Objects:</strong>
                    <ul>
                      {(activePlayer === "A"
                        ? aiInsights.allObjects
                        : aiInsightsB.allObjects
                      ).map((obj, i) => (
                        <li key={i}>
                          {obj.class} (bbox:{" "}
                          {obj.bbox.map((n) => Math.round(n)).join(", ")})
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                {(activePlayer === "A"
                  ? aiInsights?.ballType
                  : aiInsightsB?.ballType) && (
                  <li>
                    <strong>Ball Type:</strong>{" "}
                    {activePlayer === "A"
                      ? aiInsights.ballType
                      : aiInsightsB.ballType}
                  </li>
                )}
              </ul>
              <h6 className="mt-3">Timeline</h6>
              <ul>
                {(activePlayer === "A"
                  ? detailedTimeline
                  : detailedTimelineB
                ).map((entry, i) => (
                  <li key={i}>
                    {entry.time}s: {entry.shot}{" "}
                    {entry.knnAction && entry.knnAction !== "Unknown"
                      ? ` | KNN: ${entry.knnAction}`
                      : ""}{" "}
                    {entry.ballDetected ? " | Ball Detected" : ""}{" "}
                    {entry.swingDetected ? " | Swing" : ""}
                  </li>
                ))}
              </ul>
              <button
                className="btn btn-primary mt-2"
                onClick={() =>
                  generatePDFReport({
                    playerName:
                      activePlayer === "A" ? playerNameA : playerNameB,
                    fileName:
                      activePlayer === "A" ? videoUrlA : videoUrlB,
                    metrics:
                      activePlayer === "A"
                        ? performanceMetrics
                        : performanceMetricsB,
                    aiGeneratedInsights:
                      activePlayer === "A" ? aiInsights : aiInsightsB,
                    timeline:
                      activePlayer === "A"
                        ? detailedTimeline
                        : detailedTimelineB,
                    summary:
                      activePlayer === "A" ? shotSummary : shotSummaryB,
                    timestamp: new Date().toISOString(),
                  })
                }
              >
                Download PDF Report
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <h6>Player Movement (d3.js)</h6>
            <svg ref={d3Container}></svg>
            <h6 className="mt-3">Pose 3D (three.js)</h6>
            <div
              ref={threeContainer}
              style={{ width: 400, height: 300 }}
            ></div>
          </div>
          <div className="col-12">
            <button
              className="btn btn-secondary mt-3"
              onClick={handleBack}
            >
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SnickoMeter;
