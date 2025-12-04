import React, { useState, useEffect, useRef } from 'react';
import './CricketStatsDashboard.css';

const CricketStatsDashboard = ({ onBack }) => {
    const canvasRef = useRef(null);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [ballPosition, setBallPosition] = useState(null);
    const [deliveryInfo, setDeliveryInfo] = useState(null);

    const PITCH_WIDTH = 800;
    const PITCH_HEIGHT = 400;
    const WICKET_WIDTH = 20;
    const WICKET_HEIGHT = 60;
    const BOWLING_CREASE_Y = PITCH_HEIGHT * 0.1; // 10% from top (bowler's end)
    const BATTING_CREASE_Y = PITCH_HEIGHT * 0.9; // 90% from top (batsman's end)

    // Define bowling zones and lengths (example values, can be adjusted)
    const ZONES = {
        OFF: { start: PITCH_WIDTH * 0.1, end: PITCH_WIDTH * 0.4, label: 'Off Stump' },
        MIDDLE: { start: PITCH_WIDTH * 0.4, end: PITCH_WIDTH * 0.6, label: 'Middle Stump' },
        LEG: { start: PITCH_WIDTH * 0.6, end: PITCH_WIDTH * 0.9, label: 'Leg Stump' },
    };

    const LENGTHS = {
        FULL: { start: BOWLING_CREASE_Y + 20, end: PITCH_HEIGHT * 0.4, label: 'Full' },
        GOOD: { start: PITCH_HEIGHT * 0.4, end: PITCH_HEIGHT * 0.6, label: 'Good Length' },
        SHORT: { start: PITCH_HEIGHT * 0.6, end: BATTING_CREASE_Y - 20, label: 'Short' },
    };

    const getZoneAndLength = (x, y) => {
        let zone = 'Unknown';
        if (x >= ZONES.OFF.start && x <= ZONES.OFF.end) zone = ZONES.OFF.label;
        else if (x >= ZONES.MIDDLE.start && x <= ZONES.MIDDLE.end) zone = ZONES.MIDDLE.label;
        else if (x >= ZONES.LEG.start && x <= ZONES.LEG.end) zone = ZONES.LEG.label;

        let length = 'Unknown';
        if (y >= LENGTHS.FULL.start && y <= LENGTHS.FULL.end) length = LENGTHS.FULL.label;
        else if (y >= LENGTHS.GOOD.start && y <= LENGTHS.GOOD.end) length = LENGTHS.GOOD.label;
        else if (y >= LENGTHS.SHORT.start && y <= LENGTHS.SHORT.end) length = LENGTHS.SHORT.label;

        return { zone, length };
    };

    const drawPitch = (ctx) => {
        ctx.clearRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);

        // Pitch background
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);

        // Bowling and Batting Creases
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, BOWLING_CREASE_Y);
        ctx.lineTo(PITCH_WIDTH, BOWLING_CREASE_Y);
        ctx.moveTo(0, BATTING_CREASE_Y);
        ctx.lineTo(PITCH_WIDTH, BATTING_CREASE_Y);
        ctx.stroke();

        // Wickets (bowler's end)
        ctx.fillStyle = 'white';
        ctx.fillRect((PITCH_WIDTH / 2) - (WICKET_WIDTH / 2), BOWLING_CREASE_Y - WICKET_HEIGHT, WICKET_WIDTH, WICKET_HEIGHT);

        // Wickets (batsman's end)
        ctx.fillRect((PITCH_WIDTH / 2) - (WICKET_WIDTH / 2), BATTING_CREASE_Y, WICKET_WIDTH, WICKET_HEIGHT);

        // Draw zones and lengths (optional, for visual guidance)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;

        // Vertical zones
        for (const key in ZONES) {
            ctx.beginPath();
            ctx.moveTo(ZONES[key].start, 0);
            ctx.lineTo(ZONES[key].start, PITCH_HEIGHT);
            ctx.stroke();
        }

        // Horizontal lengths
        for (const key in LENGTHS) {
            ctx.beginPath();
            ctx.moveTo(0, LENGTHS[key].start);
            ctx.lineTo(PITCH_WIDTH, LENGTHS[key].start);
            ctx.stroke();
        }

        // Draw selected point
        if (selectedPoint) {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(selectedPoint.x, selectedPoint.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw ball position
        if (ballPosition) {
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(ballPosition.x, ballPosition.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        drawPitch(ctx);
    }, [selectedPoint, ballPosition]);

    const handleCanvasClick = (event) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setSelectedPoint({ x, y });
        setBallPosition(null); // Clear ball position on new selection
        setDeliveryInfo(null); // Clear delivery info on new selection
    };

    const handleBowl = () => {
        if (!selectedPoint) {
            alert('Please select a bowling point on the pitch first!');
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const startX = PITCH_WIDTH / 2; // Bowler starts from middle of the pitch width
        const startY = BOWLING_CREASE_Y; // Bowler's crease

        let currentX = startX;
        let currentY = startY;

        const animationDuration = 1000; // 1 second
        const frameRate = 30; // frames per second
        const totalFrames = (animationDuration / 1000) * frameRate;
        let frame = 0;

        const animateBall = () => {
            if (frame >= totalFrames) {
                setBallPosition(selectedPoint); // Ball reaches the selected point
                const { zone, length } = getZoneAndLength(selectedPoint.x, selectedPoint.y);
                setDeliveryInfo({ zone, length });
                return;
            }

            frame++;
            const progress = frame / totalFrames;

            currentX = startX + (selectedPoint.x - startX) * progress;
            currentY = startY + (selectedPoint.y - startY) * progress;

            setBallPosition({ x: currentX, y: currentY });
            requestAnimationFrame(animateBall);
        };

        setBallPosition({ x: startX, y: startY }); // Initial ball position
        setDeliveryInfo(null); // Clear previous delivery info
        animateBall();
    };

    return (
        <div className="cricket-pitch-container">
            <header>
                <button onClick={onBack} className="back-button">← Back</button>
                <h1> Bowling Machine</h1>
                <p className="header-subtitle">Select a zone and length to bowl</p>
            </header>
            <div className="pitch-area">
                <canvas ref={canvasRef} id="cricketPitchCanvas" width={PITCH_WIDTH} height={PITCH_HEIGHT} onClick={handleCanvasClick}></canvas>
                <div className="controls">
                    <button className="bowl-button" onClick={handleBowl}>Click Bowl</button>
                </div>
            </div>
        </div>
    );
};

export default CricketStatsDashboard;
