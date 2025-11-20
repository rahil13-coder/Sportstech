import React, { useState } from 'react';
import './Games.css'; // Assuming a Games.css will be created

import TicTacToe from './TicTacToe';
import CatchTheObject from './CatchTheObject';
import RockPaperScissors from './RockPaperScissors';
import BluffGame from './BluffGame';

const Games = ({ onBackClick }) => {
  const [currentGame, setCurrentGame] = useState(null); // 'ticTacToe', 'catchTheObject', 'rockPaperScissors', 'bluffGame'

  const renderGame = () => {
    switch (currentGame) {
      case 'ticTacToe':
        return <TicTacToe />;
      case 'catchTheObject':
        return <CatchTheObject />;
      case 'rockPaperScissors':
        return <RockPaperScissors />;
      case 'bluffGame':
        return <BluffGame />;
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ marginBottom: '30px' }}>Choose a Game to Play!</h2>
            <button onClick={() => setCurrentGame('ticTacToe')} style={{ backgroundColor: 'blue', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2em', margin: '10px' }}>
              Tic Tac Toe
            </button>
            <button onClick={() => setCurrentGame('catchTheObject')} style={{ backgroundColor: 'green', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2em', margin: '10px' }}>
              Catch the Object
            </button>
            <button onClick={() => setCurrentGame('rockPaperScissors')} style={{ backgroundColor: 'purple', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2em', margin: '10px' }}>
              Rock, Paper, Scissors
            </button>
            <button onClick={() => setCurrentGame('bluffGame')} style={{ backgroundColor: 'orange', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2em', margin: '10px' }}>
              Bluff Game
            </button>
          </div>
        );
    }
  };

  return (
    <div className="games-container" style={{ backgroundImage: 'url("/background.jpg")', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', color: 'white', padding: '20px' }}>
      <button onClick={(e) => { if (currentGame) setCurrentGame(null); else onBackClick(e); }} style={{ position: 'absolute', top: '10px', left: '80px', zIndex: 1, backgroundColor: 'skyblue' }}>
        {currentGame ? 'Back to Game Selection' : 'Back'}
      </button>
      {renderGame()}
    </div>
  );
};

export default Games;
