const { createGame, makeMove, checkWinner, checkDraw } = require('./game');

describe('createGame', () => {
  it('returns a fresh game state', () => {
    const state = createGame();
    expect(state.board).toEqual(Array(9).fill(null));
    expect(state.currentPlayer).toBe('X');
    expect(state.winner).toBeNull();
    expect(state.isDraw).toBe(false);
  });
});

describe('makeMove', () => {
  it('places the current player on the chosen cell', () => {
    const state = makeMove(createGame(), 4);
    expect(state.board[4]).toBe('X');
  });

  it('alternates between X and O', () => {
    let state = createGame();
    state = makeMove(state, 0);
    expect(state.currentPlayer).toBe('O');
    state = makeMove(state, 1);
    expect(state.currentPlayer).toBe('X');
  });

  it('does not overwrite an occupied cell', () => {
    let state = makeMove(createGame(), 0);
    const before = state;
    state = makeMove(state, 0);
    expect(state).toBe(before);
  });

  it('ignores moves after a win', () => {
    let state = createGame();
    state = makeMove(state, 0); // X
    state = makeMove(state, 3); // O
    state = makeMove(state, 1); // X
    state = makeMove(state, 4); // O
    state = makeMove(state, 2); // X wins (top row)
    const winning = state;
    state = makeMove(state, 5); // should be ignored
    expect(state).toBe(winning);
  });

  it('ignores moves after a draw', () => {
    // X O X / O X X / O X O — draw
    const moves = [0, 1, 2, 3, 4, 6, 5, 8, 7];
    let state = createGame();
    for (const i of moves) state = makeMove(state, i);
    expect(state.isDraw).toBe(true);
    const drawn = state;
    state = makeMove(state, 0);
    expect(state).toBe(drawn);
  });
});

describe('checkWinner', () => {
  it('detects a row win', () => {
    const board = ['X', 'X', 'X', null, null, null, null, null, null];
    expect(checkWinner(board)).toBe('X');
  });

  it('detects a column win', () => {
    const board = ['O', null, null, 'O', null, null, 'O', null, null];
    expect(checkWinner(board)).toBe('O');
  });

  it('detects a diagonal win', () => {
    const board = ['X', null, null, null, 'X', null, null, null, 'X'];
    expect(checkWinner(board)).toBe('X');
  });

  it('returns null when no winner', () => {
    expect(checkWinner(Array(9).fill(null))).toBeNull();
  });

  it('detects all 8 win conditions', () => {
    const WIN_LINES = [
      [0, 1, 2],[3, 4, 5],[6, 7, 8],
      [0, 3, 6],[1, 4, 7],[2, 5, 8],
      [0, 4, 8],[2, 4, 6],
    ];
    for (const line of WIN_LINES) {
      const board = Array(9).fill(null);
      for (const i of line) board[i] = 'X';
      expect(checkWinner(board)).toBe('X');
    }
  });
});

describe('checkDraw', () => {
  it('returns true when all cells filled', () => {
    expect(checkDraw(Array(9).fill('X'))).toBe(true);
  });

  it('returns false when board has empty cells', () => {
    const board = Array(9).fill('X');
    board[4] = null;
    expect(checkDraw(board)).toBe(false);
  });
});

describe('full game scenarios', () => {
  it('X wins with top row', () => {
    let state = createGame();
    state = makeMove(state, 0); // X
    state = makeMove(state, 3); // O
    state = makeMove(state, 1); // X
    state = makeMove(state, 4); // O
    state = makeMove(state, 2); // X wins
    expect(state.winner).toBe('X');
    expect(state.isDraw).toBe(false);
  });

  it('O wins with left column', () => {
    let state = createGame();
    state = makeMove(state, 1); // X
    state = makeMove(state, 0); // O
    state = makeMove(state, 2); // X
    state = makeMove(state, 3); // O
    state = makeMove(state, 8); // X
    state = makeMove(state, 6); // O wins
    expect(state.winner).toBe('O');
  });

  it('results in a draw when board is full with no winner', () => {
    // X O X / O X X / O X O  — no winning line
    const moves = [0, 1, 2, 3, 4, 6, 5, 8, 7];
    let state = createGame();
    for (const i of moves) state = makeMove(state, i);
    expect(state.winner).toBeNull();
    expect(state.isDraw).toBe(true);
  });
});
