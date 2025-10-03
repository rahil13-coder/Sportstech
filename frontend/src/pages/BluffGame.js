import React, { useState } from 'react';

const BluffGame = () => {
  const [playerGuess, setPlayerGuess] = useState('');
  const [computerNumber, setComputerNumber] = useState(null);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [bluffAttempted, setBluffAttempted] = useState(false);

  const startGame = () => {
    setComputerNumber(Math.floor(Math.random() * 10) + 1); // Computer picks a number 1-10
    setPlayerGuess('');
    setMessage('Computer has picked a number. Make your guess (1-10) or bluff!');
    setGameStarted(true);
    setBluffAttempted(false);
  };

  const handleGuess = () => {
    const guess = parseInt(playerGuess);
    if (isNaN(guess) || guess < 1 || guess > 10) {
      setMessage('Please enter a valid number between 1 and 10.');
      return;
    }

    if (guess === computerNumber) {
      setMessage(`You guessed correctly! The number was ${computerNumber}. You win!`);
    } else {
      setMessage(`Your guess was ${guess}. The number was ${computerNumber}. You lose.`);
    }
    setGameStarted(false);
  };

  const handleBluff = () => {
    if (bluffAttempted) {
      setMessage('You already tried to bluff this round!');
      return;
    }

    // Simplified bluff logic: 50% chance to succeed
    const bluffSucceeded = Math.random() < 0.5;

    if (bluffSucceeded) {
      setMessage(`You successfully bluffed! The number was ${computerNumber}. You win!`);
    } else {
      setMessage(`Your bluff was called! The number was ${computerNumber}. You lose.`);
    }
    setBluffAttempted(true);
    setGameStarted(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: '20px', borderRadius: '10px', maxWidth: '600px', margin: '20px auto' }}>
      <h2 style={{ color: 'white', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontSize: '36px' }}>Bluff Game</h2>
      <div style={{ color: 'white', fontSize: '20px', marginBottom: '20px', textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '10px', borderRadius: '5px' }}>{message}</div>

      {!gameStarted ? (
        <button
          onClick={startGame}
          style={{
            padding: '10px 20px',
            fontSize: '18px',
            cursor: 'pointer',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          Start New Game
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            type="number"
            min="1"
            max="10"
            value={playerGuess}
            onChange={(e) => setPlayerGuess(e.target.value)}
            placeholder="Your guess (1-10)"
            style={{
              padding: '10px',
              fontSize: '16px',
              marginBottom: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              width: '200px',
              textAlign: 'center',
            }}
          />
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleGuess}
              style={{
                padding: '10px 20px',
                fontSize: '18px',
                cursor: 'pointer',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                marginRight: '10px',
              }}
            >
              Guess
            </button>
            <button
              onClick={handleBluff}
              disabled={bluffAttempted}
              style={{
                padding: '10px 20px',
                fontSize: '18px',
                cursor: 'pointer',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              Bluff!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BluffGame;
