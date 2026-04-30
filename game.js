const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function createGame() {
  return {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    isDraw: false,
  };
}

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function checkDraw(board) {
  return board.every(cell => cell !== null);
}

function makeMove(state, cellIndex) {
  if (state.winner || state.isDraw) return state;
  if (state.board[cellIndex] !== null) return state;

  const newBoard = [...state.board];
  newBoard[cellIndex] = state.currentPlayer;

  const winner = checkWinner(newBoard);
  const isDraw = !winner && checkDraw(newBoard);

  return {
    board: newBoard,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    winner,
    isDraw,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { createGame, makeMove, checkWinner, checkDraw };
}
