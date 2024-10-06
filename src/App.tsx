import { useState } from 'react';

function Square({ value, onSquareClick, isWinningSquare }: {
  value: string;
  onSquareClick: () => void;
  isWinningSquare: boolean;
}) {
  return (
    <button className={`square ${isWinningSquare ? 'highlight' : ''}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay } : {
  xIsNext: boolean;
  squares: string[];
  onPlay: (nextSquares: string[], location: { row: number, col: number }) => void;
}) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }

    // Calculate the row and column based on the index `i`
    const row = Math.floor(i / 3);
    const col = i % 3;
    onPlay(nextSquares, { row, col });
  }

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningLine = winnerInfo ? winnerInfo.line : null;

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every(Boolean)) {
    status = 'Draw';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const size = 3;

  return (
    <>
      <div className="status">{status}</div>
      {Array.from({ length: size }).map((_, i) => {
        return (
          <div className="board-row" key={i}>
            {Array.from({ length: size }).map((_, j) => {
              const index = i * size + j;
              const isWinningSquare = !!(winningLine && winningLine.includes(index)); // Ensure isWinningSquare is always a boolean
              return (
                <Square
                  key={index}
                  value={squares[index]}
                  onSquareClick={() => handleClick(index)}
                  isWinningSquare={isWinningSquare} // Pass this prop to Square
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState<{ squares: string[], location: { row: number, col: number } | null }[]>([{ squares: Array(9).fill(null), location: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true); // State for sorting order
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares: any, location: any) {
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: any) {
    setCurrentMove(nextMove);
  }

  // Toggle sorting order between ascending and descending
  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  // Sort moves based on the current sorting order (ascending/descending)
  const sortedMoves = isAscending ? history.map((_, move) => move) : [...history.keys()].reverse();

  const moves = sortedMoves.map((move) => {
    const { location } = history[move];
    const row = location ? location.row : null;
    const col = location ? location.col : null;

    let description;
    if (move > 0) {
      description = `Go to move #${move} (${row}, ${col})`;
    } else {
      description = 'Go to game start';
    }

    // Conditionally render either the button or the text
    if (move === currentMove) {
      return (
        <li key={move}>
          <span>You are at move #{move} ({row}, {col})</span>
        </li>
      );
    } else {
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );
    }
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={(nextSquares, location) => handlePlay(nextSquares, location)} />
      </div>
      <div className="game-info">
        <button onClick={toggleSortOrder}>
          {isAscending ? 'Sort Descending' : 'Sort Ascending'}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares: string[]) {
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
      return { winner: squares[a], line: [a, b, c] }; // Return winner and winning line
    }
  }
  return null; // No winner
}

