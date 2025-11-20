import React, { useState, useEffect } from 'react';

const TicTacToe = () => {
  const initialBoard = Array(9).fill(null);
  const [board, setBoard] = useState(initialBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState(null); // 'player' or 'computer'

  // Effect for computer's turn
  useEffect(() => {
    if (gameMode === 'computer' && !xIsNext && !winner) {
      // Add a small delay for a more natural feel
      const timer = setTimeout(() => {
        const computerMove = getComputerMove(board);
        if (computerMove !== null) {
          handleClick(computerMove);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, board, gameMode, winner]);

  // Effect to check for winner or draw
  useEffect(() => {
    const calculatedWinner = calculateWinner(board);
    if (calculatedWinner) {
      setWinner(calculatedWinner);
    } else if (board.every(square => square !== null)) {
      setWinner('Draw');
    }
  }, [board]);

  const handleClick = (index) => {
    if (winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const getComputerMove = (currentBoard) => {
    // 1. Check for a winning move for 'O'
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const tempBoard = [...currentBoard];
        tempBoard[i] = 'O';
        if (calculateWinner(tempBoard) === 'O') {
          return i;
        }
      }
    }

    // 2. Check to block 'X' from winning
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const tempBoard = [...currentBoard];
        tempBoard[i] = 'X';
        if (calculateWinner(tempBoard) === 'X') {
          return i;
        }
      }
    }

    // 3. Take the center if available
    if (!currentBoard[4]) {
      return 4;
    }

    // 4. Take a random available corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !currentBoard[i]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // 5. Take any random available square
    const availableSquares = currentBoard.map((sq, i) => sq === null ? i : null).filter(i => i !== null);
    if(availableSquares.length > 0) {
        return availableSquares[Math.floor(Math.random() * availableSquares.length)];
    }

    return null;
  };

  const renderSquare = (index) => (
    <button
      style={{
        width: '60px',
        height: '60px',
        backgroundColor: '#fff',
        border: '1px solid #999',
        fontSize: '24px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={() => handleClick(index)}
    >
      {board[index]}
    </button>
  );

  const getStatus = () => {
    if (winner) {
      return winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}`;
    } else {
      return `Next player: ${xIsNext ? 'X' : 'O'}`;
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setXIsNext(true);
    setWinner(null);
    setGameMode(null); // Go back to mode selection
  };

  const selectMode = (mode) => {
    setGameMode(mode);
  };

  if (!gameMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', color: 'white' }}>
        <h2 style={{ marginBottom: '20px' }}>Select Game Mode</h2>
        <button style={buttonStyle} onClick={() => selectMode('player')}>Play vs. Player</button>
        <button style={buttonStyle} onClick={() => selectMode('computer')}>Play vs. Computer</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <h2 style={{ color: 'white', marginBottom: '10px' }}>Tic Tac Toe</h2>
      <div style={{ marginBottom: '10px', color: 'white', fontSize: '20px' }}>{getStatus()}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 60px)',
          gridGap: '0px',
          border: '1px solid #999',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => renderSquare(index))}
      </div>
      <button
        style={{ ...buttonStyle, marginTop: '20px' }}
        onClick={resetGame}
      >
        New Game
      </button>
    </div>
  );
};

const buttonStyle = {
  marginTop: '10px',
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  minWidth: '180px'
};

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default TicTacToe;