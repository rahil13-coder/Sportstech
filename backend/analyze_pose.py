import sys
import cv2
import mediapipe as mp
import json

video_path = sys.argv[1]

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)
frame_count = 0
detected_shots = []

frame_interval = int(fps // 2) or 1  # Sample 2 frames per second minimum
last_shot = None

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    if frame_count % frame_interval != 0:
        frame_count += 1
        continue

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(frame_rgb)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        right_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW]
        right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]

        elbow_y = right_elbow.y
        wrist_y = right_wrist.y

        if wrist_y < elbow_y:
            shot = "Cover Drive"
        elif wrist_y > elbow_y + 0.1:
            shot = "Pull Shot"
        else:
            shot = "Straight Drive"

        if shot != last_shot:
            timestamp_sec = round(frame_count / fps, 2)
            detected_shots.append({
                "frame": frame_count,
                "time": timestamp_sec,
                "shot": shot
            })
            last_shot = shot

    frame_count += 1

cap.release()

# Summary
all_shots = [item["shot"] for item in detected_shots]
shot_summary = {shot: all_shots.count(shot) for shot in set(all_shots)}

output = {
    "summary": {
        "totalFramesAnalyzed": frame_count,
        "uniqueShots": list(shot_summary.keys()),
        "shotFrequency": shot_summary
    },
    "detailedShotTimeline": detected_shots
}

print(json.dumps(output, indent=2))


