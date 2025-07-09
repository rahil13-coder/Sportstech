import sys
import json
import numpy as np
import librosa

def analyze_audio(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=None, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)

        frame_length = int(sr * 0.05)
        hop_length = int(frame_length * 0.5)

        # ✅ RMS-based spike detection (improved)
        rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
        rms_norm = rms / np.max(rms)

        spike_threshold = 0.3
        spike_index = next(
            (i for i in range(1, len(rms_norm)) 
             if rms_norm[i] > spike_threshold and rms_norm[i] > rms_norm[i - 1] * 1.3), 
            -1
        )

        timestamp = round((spike_index * hop_length) / sr, 2) if spike_index != -1 else None

        # 🎯 Hit classification with ZCR and Spectral Centroid
        hit_status = "No contact detected ❌"
        if spike_index != -1:
            start = spike_index * hop_length
            end = start + frame_length
            segment = y[start:end]

            zcr = np.mean(librosa.feature.zero_crossing_rate(segment))
            centroid = np.mean(librosa.feature.spectral_centroid(y=segment, sr=sr))
            mfccs = librosa.feature.mfcc(y=segment, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfccs)

            if zcr > 0.1 and centroid > 3000:
                hit_status = "Ball hit the bat 🏏"
            elif zcr > 0.08:
                hit_status = "Possible edge or glove contact 🤔"
            else:
                hit_status = "Unclear – possible noise"

        # 🎵 Simple music detection using RMS variation
        global_rms = librosa.feature.rms(y=y)[0]
        music_detected = np.std(global_rms) > 0.03 and np.mean(global_rms) > 0.01

        return {
            "spikeDetected": spike_index != -1,
            "timestamp": timestamp,
            "hitStatus": hit_status,
            "musicDetected": bool(music_detected)
        }

    except Exception as e:
        return {"error": f"Audio processing failed: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Missing audio file path"}))
        sys.exit(1)

    audio_path = sys.argv[1]
    result = analyze_audio(audio_path)
    print(json.dumps(result))

