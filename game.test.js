const { checkWinner, checkDraw, WINNING_COMBINATIONS } = require('./game');

describe('checkWinner', () => {
  test('returns null for an empty board', () => {
    const board = Array(9).fill(null);
    expect(checkWinner(board)).toBeNull();
  });

  test('returns null when no winning line exists', () => {
    // X O X / O X O / O X O — draw board
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(checkWinner(board)).toBeNull();
  });

  test('detects top row win for X', () => {
    const board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    const result = checkWinner(board);
    expect(result).not.toBeNull();
    expect(result.winner).toBe('X');
    expect(result.combo).toEqual([0, 1, 2]);
  });

  test('detects middle row win for O', () => {
    const board = ['X', null, null, 'O', 'O', 'O', 'X', null, null];
    const result = checkWinner(board);
    expect(result).not.toBeNull();
    expect(result.winner).toBe('O');
    expect(result.combo).toEqual([3, 4, 5]);
  });

  test('detects bottom row win', () => {
    const board = [null, null, null, null, null, null, 'X', 'X', 'X'];
    const result = checkWinner(board);
    expect(result.winner).toBe('X');
    expect(result.combo).toEqual([6, 7, 8]);
  });

  test('detects left column win', () => {
    const board = ['O', null, null, 'O', null, null, 'O', null, null];
    const result = checkWinner(board);
    expect(result.winner).toBe('O');
    expect(result.combo).toEqual([0, 3, 6]);
  });

  test('detects middle column win', () => {
    const board = [null, 'X', null, null, 'X', null, null, 'X', null];
    const result = checkWinner(board);
    expect(result.winner).toBe('X');
    expect(result.combo).toEqual([1, 4, 7]);
  });

  test('detects right column win', () => {
    const board = [null, null, 'O', null, null, 'O', null, null, 'O'];
    const result = checkWinner(board);
    expect(result.winner).toBe('O');
    expect(result.combo).toEqual([2, 5, 8]);
  });

  test('detects top-left to bottom-right diagonal win', () => {
    const board = ['X', null, null, null, 'X', null, null, null, 'X'];
    const result = checkWinner(board);
    expect(result.winner).toBe('X');
    expect(result.combo).toEqual([0, 4, 8]);
  });

  test('detects top-right to bottom-left diagonal win', () => {
    const board = [null, null, 'O', null, 'O', null, 'O', null, null];
    const result = checkWinner(board);
    expect(result.winner).toBe('O');
    expect(result.combo).toEqual([2, 4, 6]);
  });
});

describe('checkDraw', () => {
  test('returns false for an empty board', () => {
    expect(checkDraw(Array(9).fill(null))).toBe(false);
  });

  test('returns false when board is partially filled', () => {
    const board = ['X', 'O', null, 'O', 'X', null, null, null, null];
    expect(checkDraw(board)).toBe(false);
  });

  test('returns true when all cells are filled', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(checkDraw(board)).toBe(true);
  });
});

describe('WINNING_COMBINATIONS', () => {
  test('contains exactly 8 combinations', () => {
    expect(WINNING_COMBINATIONS).toHaveLength(8);
  });

  test('each combination has exactly 3 indices', () => {
    WINNING_COMBINATIONS.forEach(combo => {
      expect(combo).toHaveLength(3);
    });
  });

  test('all indices are in range 0–8', () => {
    WINNING_COMBINATIONS.forEach(combo => {
      combo.forEach(i => {
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThanOrEqual(8);
      });
    });
  });
});
