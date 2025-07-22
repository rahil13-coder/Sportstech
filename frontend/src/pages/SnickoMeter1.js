import React, { useRef, useEffect, useState } from "react";

const SnickoMeter1 = () => {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const [ballX, setBallX] = useState(400);
  const [ballY, setBallY] = useState(100);
  const [ballMoving, setBallMoving] = useState(false);
  const [message, setMessage] = useState("🎮 Press SPACE to bowl the ball!");
  const [ballDirection, setBallDirection] = useState(null);
  const [swingAngle, setSwingAngle] = useState(90);
  const [ballSpeed, setBallSpeed] = useState(5);
  const [isOut, setIsOut] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const canvasWidth = 800;
  const canvasHeight = 500;
  const batsmanY = 420;

  useEffect(() => {
    // Focus the hidden input on mobile to bring up the keyboard
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let countdownInterval;
    if (isOut) {
      setCountdown(21);
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [isOut]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        if (!ballMoving && !isOut) {
          const angle = [89, 90, 91][Math.floor(Math.random() * 3)];
          setSwingAngle(angle);

          const speedOptions = [3, 4, 5, 6, 7, 8, 9, 10];
          const randomSpeed = speedOptions[Math.floor(Math.random() * speedOptions.length)];
          setBallSpeed(randomSpeed);

          setMessage(`🏏 Ball coming! Swing angle: ${angle}°, Speed: ${randomSpeed}`);
          setBallX(400);
          setBallY(100);
          setBallDirection(null);
          setBallMoving(true);
        }
        return;
      }

      if (
        ballMoving &&
        ballY >= batsmanY - 20 &&
        ballY <= batsmanY + 20 &&
        !ballDirection
      ) {
        if (key === "ArrowDown" || key === "8") {
          const directions = ["straight", "offside", "legside"];
          const randomDir = directions[Math.floor(Math.random() * directions.length)];
          setBallDirection(randomDir);
          switch (randomDir) {
            case "straight":
              setMessage("🎲 Random Shot: 🚀 Straight Drive!");
              break;
            case "offside":
              setMessage("🎲 Random Shot: 🏏 Offside Shot!");
              break;
            case "legside":
              setMessage("🎲 Random Shot: 🏏 Leg Side Shot!");
              break;
            default:
              break;
          }
        } else {
          switch (key) {
            case "ArrowUp":
            case "2":
              setBallDirection("straight");
              setMessage("🚀 Straight Drive!");
              break;
            case "ArrowLeft":
            case "4":
              setBallDirection("offside");
              setMessage("🏏 Offside Shot!");
              break;
            case "ArrowRight":
            case "6":
              setBallDirection("legside");
              setMessage("🏏 Leg Side Shot!");
              break;
            default:
              break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ballMoving, ballY, ballDirection, isOut]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const drawScene = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.strokeStyle = "gray";
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(50, 50, 700, 400);

      ctx.fillStyle = "blue";
      ctx.fillRect(380, 50, 40, 40);

      ctx.fillStyle = "green";
      ctx.fillRect(380, batsmanY, 40, 40);

      ctx.beginPath();
      ctx.arc(ballX, ballY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    };

    const interval = setInterval(() => {
      if (ballMoving) {
        setBallY((prevY) => {
          let newY = prevY;

          if (!ballDirection) {
            newY += ballSpeed;
            const angleRad = (swingAngle * Math.PI) / 180;
            const dx = Math.tan(angleRad - Math.PI / 2) * 2;
            setBallX((prevX) => prevX + dx);

            if (newY >= batsmanY && ballX >= 380 && ballX <= 420) {
              setBallMoving(false);
              setIsOut(true);
              setMessage("❌ OUT! Wait 21s to Retry or Play Again Instantly Below.");
              setTimeout(() => {
                setIsOut(false);
                setMessage("🎮 Press SPACE to bowl!!");
              }, 21000);
            }

            if (newY > batsmanY + 30 && !isOut) {
              setBallMoving(false);
              setMessage("❌ Missed! Press SPACE to bowl again.");
            }
          } else {
            switch (ballDirection) {
              case "straight":
                newY -= 7;
                break;
              case "cover":
                newY -= 4;
                setBallX((x) => x - 5);
                break;
              case "legside":
                newY -= 4;
                setBallX((x) => x + 5);
                break;
              case "offside":
                newY -= 2;
                setBallX((x) => x - 6);
                break;
              default:
                break;
            }

            if (newY < 0 || ballX < 0 || ballX > canvasWidth) {
              setBallMoving(false);
              setMessage("✅ Shot Played! Press SPACE to bowl again.");
            }
          }

          return newY;
        });
      }

      drawScene();
    }, 30);

    return () => clearInterval(interval);
  }, [ballMoving, ballDirection, ballX, ballY, swingAngle, ballSpeed, isOut]);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "1rem",
        padding: "0 10px",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ fontSize: "1.5rem" }}>🏏 SNICOMETER1 – Cricket Shot Game</h2>
      <p style={{ fontSize: "1rem" }}>{message}</p>

      {isOut && countdown > 0 && (
        <>
          <p style={{ color: "red", fontWeight: "bold" }}>
            ⏳ Retry in: {countdown}s
          </p>
          <button
            onClick={() =>
              window.open("https://occasion.ltd/", "_blank")
            }
            style={{
              padding: "10px 20px",
              margin: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            🔁 Play Again Instantly
          </button>
        </>
      )}

      <p style={{ fontSize: "0.95rem" }}>
        ⌨️ Controls: <strong>SPACE</strong> = Bowl | <strong>↑ / 2</strong> = Straight |{" "}
        <strong>↓ / 8</strong> = Random | <strong>← / 4</strong> = Offside | <strong>→ / 6</strong> = Leg Side
      </p>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            border: "2px solid black",
            background: "#f9f9f9",
            width: "100%",
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </div>

      {/* Hidden input for mobile to trigger keyboard */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        onKeyDown={(e) => {
          if (e.key === "2" || e.key === "4" || e.key === "6" || e.key === "8" || e.key === " ") {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: e.key }));
          }
        }}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default SnickoMeter1;
