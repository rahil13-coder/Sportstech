import React, { useState } from 'react';

const choices = ['rock', 'paper', 'scissors'];

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ player: 0, computer: 0 });

  const handlePlay = (choice) => {
    setPlayerChoice(choice);
    const randomIndex = Math.floor(Math.random() * choices.length);
    const compChoice = choices[randomIndex];
    setComputerChoice(compChoice);
    determineWinner(choice, compChoice);
  };

  const determineWinner = (player, computer) => {
    if (player === computer) {
      setResult("It's a tie!");
    } else if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      setResult("You win!");
      setScore(prevScore => ({ ...prevScore, player: prevScore.player + 1 }));
    } else {
      setResult("Computer wins!");
      setScore(prevScore => ({ ...prevScore, computer: prevScore.computer + 1 }));
    }
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
    setScore({ player: 0, computer: 0 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Rock, Paper, Scissors</h2>
      <div style={{ marginBottom: '20px' }}>
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => handlePlay(choice)}
            style={{
              padding: '10px 20px',
              fontSize: '18px',
              margin: '0 10px',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              textTransform: 'capitalize',
            }}
          >
            {choice}
          </button>
        ))}
      </div>

      {playerChoice && computerChoice && (
        <div style={{
          color: 'white',
          fontSize: '22px',
          marginBottom: '20px',
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #555',
          maxWidth: '400px', // Limit width for better readability
          margin: '0 auto 20px auto', // Center the div and add bottom margin
        }}>
          <p style={{ marginBottom: '10px' }}>You chose: <strong style={{ textTransform: 'capitalize', color: '#87CEEB' }}>{playerChoice}</strong></p>
          <p style={{ marginBottom: '15px' }}>Computer chose: <strong style={{ textTransform: 'capitalize', color: '#FF6347' }}>{computerChoice}</strong></p>
          <p style={{ fontWeight: 'bold', marginTop: '10px', fontSize: '26px', color: '#ADFF2F' }}>{result}</p>
        </div>
      )}

      <div style={{ color: 'white', fontSize: '18px', marginBottom: '20px' }}>
        Score: Player {score.player} - {score.computer} Computer
      </div>

      <button
        onClick={resetGame}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Reset Score
      </button>
    </div>
  );
};

export default RockPaperScissors;
