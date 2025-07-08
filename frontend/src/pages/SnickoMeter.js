import React, { useState, useRef } from 'react';

function SnickoMeter() {
    const [spikeDetected, setSpikeDetected] = useState(false);
    const [timestamp, setTimestamp] = useState(null);
    const [error, setError] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [hitStatus, setHitStatus] = useState(null);
    const [musicDetected, setMusicDetected] = useState(false);
    const audioCtxRef = useRef(null);
    const videoRef = useRef(null);

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setVideoUrl(previewUrl);

        setIsAnalyzing(true);
        setSpikeDetected(false);
        setTimestamp(null);
        setError('');
        setHitStatus(null);
        setMusicDetected(false);

        try {
            const arrayBuffer = await file.arrayBuffer();

            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
            const rawData = audioBuffer.getChannelData(0); // mono

            const samples = 1000;
            const blockSize = Math.floor(rawData.length / samples);
            const amplitudes = [];

            for (let i = 0; i < samples; i++) {
                let sum = 0;
                for (let j = 0; j < blockSize; j++) {
                    sum += Math.abs(rawData[(i * blockSize) + j]);
                }
                amplitudes.push(sum / blockSize);
            }

            // MUSIC DETECTION — crude pattern of consistent high amplitude
            const highEnergy = amplitudes.filter(a => a > 0.2);
            const musicLikelihood = highEnergy.length / amplitudes.length;
            if (musicLikelihood > 0.5) {
                setMusicDetected(true);
                // Optionally simulate muting
                if (videoRef.current) {
                    videoRef.current.muted = true;
                }
            }

            // Spike Detection
            const threshold = 0.25;
            const spikeIndex = amplitudes.findIndex((val, i) =>
                i > 5 && val > threshold && val > amplitudes[i - 1] * 1.5
            );

            if (spikeIndex !== -1) {
                const timeInSec = ((spikeIndex * blockSize) / audioBuffer.sampleRate).toFixed(2);
                setSpikeDetected(true);
                setTimestamp(timeInSec);

                // AI hit decision based on spike intensity
                const spikeValue = amplitudes[spikeIndex];
                if (spikeValue > 0.4) {
                    setHitStatus("Ball hit the bat 🏏");
                } else {
                    setHitStatus("Possible edge or noise – uncertain contact 🤔");
                }
            } else {
                setSpikeDetected(false);
                setHitStatus("No contact detected ❌");
            }

        } catch (err) {
            console.error("Audio analysis error:", err);
            setError("Unable to analyze video. Make sure it has audio.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="card p-4 bg-light mb-4">
            <h4>🎙️ Snicko Meter Technology</h4>
            <p>Upload a cricket video. This detects bat-ball contact & mutes background music if detected.</p>
            <input type="file" accept="video/*" className="form-control mb-3" onChange={handleVideoUpload} />

            {videoUrl && (
                <div className="mb-3">
                    <video ref={videoRef} src={videoUrl} controls width="100%" />
                </div>
            )}

            {isAnalyzing && <div className="alert alert-info">Analyzing audio waveform... Please wait.</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!isAnalyzing && (
                <>
                    {spikeDetected !== null && (
                        <div className={`alert ${spikeDetected ? "alert-success" : "alert-warning"}`}>
                            {spikeDetected
                                ? `Spike Detected at ${timestamp} seconds`
                                : "No spike detected in audio."}
                        </div>
                    )}

                    {hitStatus && (
                        <div className={`alert ${hitStatus.includes("hit") ? "alert-success" : "alert-warning"}`}>
                            <strong>AI Decision:</strong> {hitStatus}
                        </div>
                    )}

                    {musicDetected && (
                        <div className="alert alert-warning">
                            🎵 <strong>Music Detected:</strong> Background music detected — video is muted to reduce noise.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default SnickoMeter;
