import React, { useState, useEffect, useRef } from 'react';

const CatchTheObject = () => {
  const [score, setScore] = useState(0);
  const [objectPosition, setObjectPosition] = useState({ x: 50, y: 50 });
  const [gameRunning, setGameRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds game time
  const gameAreaRef = useRef(null);

  const objectSize = 30; // Size of the object

  useEffect(() => {
    let objectMoveInterval;
    let timerInterval;

    if (gameRunning) {
      // Object movement
      objectMoveInterval = setInterval(() => {
        if (gameAreaRef.current) {
          const gameAreaWidth = gameAreaRef.current.offsetWidth;
          const gameAreaHeight = gameAreaRef.current.offsetHeight;

          const newX = Math.random() * (gameAreaWidth - objectSize);
          const newY = Math.random() * (gameAreaHeight - objectSize);
          setObjectPosition({ x: newX, y: newY });
        }
      }, 1000); // Object moves every 1 second

      // Game timer
      timerInterval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            clearInterval(objectMoveInterval);
            setGameRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(objectMoveInterval);
      clearInterval(timerInterval);
    };
  }, [gameRunning]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameRunning(true);
  };

  const handleObjectClick = () => {
    if (gameRunning) {
      setScore(prevScore => prevScore + 1);
      // Move object immediately after click
      if (gameAreaRef.current) {
        const gameAreaWidth = gameAreaRef.current.offsetWidth;
        const gameAreaHeight = gameAreaRef.current.offsetHeight;
        const newX = Math.random() * (gameAreaWidth - objectSize);
        const newY = Math.random() * (gameAreaHeight - objectSize);
        setObjectPosition({ x: newX, y: newY });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Catch the Object Game</h2>
      <div style={{ color: 'white', fontSize: '20px', marginBottom: '10px' }}>
        Score: {score} | Time Left: {timeLeft}s
      </div>
      {!gameRunning && timeLeft === 0 && (
        <div style={{ color: 'white', fontSize: '24px', marginBottom: '10px' }}>Game Over! Final Score: {score}</div>
      )}
      <button
        onClick={startGame}
        disabled={gameRunning}
        style={{
          padding: '10px 20px',
          fontSize: '18px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginBottom: '20px',
        }}
      >
        {timeLeft === 0 ? 'Play Again' : 'Start Game'}
      </button>
      <div
        ref={gameAreaRef}
        style={{
          width: '800px',
          height: '400px',
          backgroundColor: '#333',
          border: '2px solid #555',
          position: 'relative',
          overflow: 'hidden',
          cursor: gameRunning ? 'crosshair' : 'default',
        }}
      >
        {gameRunning && (
          <div
            style={{
              position: 'absolute',
              left: objectPosition.x,
              top: objectPosition.y,
              width: objectSize,
              height: objectSize,
              backgroundColor: 'red',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
            onClick={handleObjectClick}
          ></div>
        )}
      </div>
    </div>
  );
};

export default CatchTheObject;
