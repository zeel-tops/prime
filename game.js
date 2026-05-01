const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let board;
let currentPlayer;
let gameOver;

function initGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;

  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    cell.textContent = '';
    cell.disabled = false;
    cell.className = 'cell';
    cell.setAttribute('aria-pressed', 'false');
    cell.setAttribute('aria-label', `Cell ${i + 1}`);
  });

  const statusEl = document.getElementById('status');
  statusEl.textContent = "Player X's turn";
  statusEl.className = 'status';
}

function checkWinner(boardState) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return { winner: boardState[a], combo: [a, b, c] };
    }
  }
  return null;
}

function checkDraw(boardState) {
  return boardState.every(cell => cell !== null);
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = parseInt(cell.dataset.index, 10);

  if (gameOver || board[index] !== null) return;

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.disabled = true;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.setAttribute('aria-pressed', 'true');
  cell.setAttribute('aria-label', `Cell ${index + 1}: ${currentPlayer}`);

  const result = checkWinner(board);
  const statusEl = document.getElementById('status');
  const allCells = document.querySelectorAll('.cell');

  if (result) {
    gameOver = true;
    statusEl.textContent = `Player ${result.winner} wins!`;
    statusEl.className = 'status winner';

    result.combo.forEach(i => { allCells[i].classList.add('winning'); });
    allCells.forEach(c => { c.disabled = true; });
    return;
  }

  if (checkDraw(board)) {
    gameOver = true;
    statusEl.textContent = "It's a draw!";
    statusEl.className = 'status draw';
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusEl.textContent = `Player ${currentPlayer}'s turn`;
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
  });

  document.getElementById('resetBtn').addEventListener('click', initGame);

  initGame();
}

if (typeof module !== 'undefined') {
  module.exports = { checkWinner, checkDraw, WINNING_COMBINATIONS };
}
