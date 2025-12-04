import React, { useState } from 'react';
import './Games.css';

import TicTacToe from './TicTacToe';
import CatchTheObject from './CatchTheObject';
import RockPaperScissors from './RockPaperScissors';
import BluffGame from './BluffGame';


const Games = ({ onBackClick }) => {
  const [currentGame, setCurrentGame] = useState(null);

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
          <div className="game-selection" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '70vh',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '40px 20px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{ 
              fontSize: '3em', 
              marginBottom: '40px',
              background: 'linear-gradient(45deg, #ffd700, #ff6b35)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255,215,0,0.5)'
            }}>
              🎮 Game Hub
            </h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', width: '100%', maxWidth: '600px' }}>
              <button 
                onClick={() => setCurrentGame('ticTacToe')} 
                className="game-btn"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '20px 30px',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '1.3em',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
                }}
              >
                🎯 Tic Tac Toe
              </button>
              
              <button 
                onClick={() => setCurrentGame('catchTheObject')} 
                className="game-btn"
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  padding: '20px 30px',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '1.3em',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 30px rgba(245, 87, 108, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.4)';
                }}
              >
                🕹️ Catch the Object
              </button>
              
              <button 
                onClick={() => setCurrentGame('rockPaperScissors')} 
                className="game-btn"
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  padding: '20px 30px',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '1.3em',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 30px rgba(79, 172, 254, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(79, 172, 254, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(79, 172, 254, 0.4)';
                }}
              >
                ✂️ Rock Paper Scissors
              </button>
              
              <button 
                onClick={() => setCurrentGame('bluffGame')} 
                className="game-btn"
                style={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  padding: '20px 30px',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '1.3em',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 30px rgba(250, 112, 154, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(250, 112, 154, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(250, 112, 154, 0.4)';
                }}
              >
                🃏 Bluff Game
              </button>
              
              <button 
                onClick={() => setCurrentGame('seep')} 
                className="game-btn"
                style={{
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  padding: '20px 30px',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '1.3em',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 30px rgba(177, 239, 125, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(177, 239, 125, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(177, 239, 125, 0.4)';
                }}
              >
                🃏 SEEP (Indian Card Game)
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="games-container" style={{ 
      backgroundImage: 'url("/background.jpg")', 
      backgroundSize: 'cover', 
      backgroundRepeat: 'no-repeat', 
      backgroundPosition: 'center', 
      backgroundAttachment: 'fixed',
      color: 'white', 
      minHeight: '100vh',
      padding: '20px',
      position: 'relative'
    }}>
      <button 
        onClick={(e) => { 
          if (currentGame) setCurrentGame(null); 
          else onBackClick(e); 
        }} 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '20px', 
          zIndex: 1000, 
          background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          fontSize: '1.1em',
          fontWeight: 'bold',
          borderRadius: '25px',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(255,107,107,0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 12px 35px rgba(255,107,107,0.6)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 25px rgba(255,107,107,0.4)';
        }}
      >
        {currentGame ? '← Back to Games' : '← Back'}
      </button>
      {renderGame()}
    </div>
  );
};

export default Games;
