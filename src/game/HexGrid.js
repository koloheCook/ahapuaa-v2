// Pointy-Topped, Even-O Offset. Neighbor math is locked — do not derive.
export class HexGrid {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
  }

  // Even-O offset: offset direction flips based on row parity.
  getNeighbors(col, row) {
    const candidates = (row % 2 === 0)
      ? [
          [col-1, row],   [col+1, row],
          [col,   row-1], [col,   row+1],
          [col-1, row-1], [col-1, row+1],
        ]
      : [
          [col-1, row],   [col+1, row],
          [col,   row-1], [col,   row+1],
          [col+1, row-1], [col+1, row+1],
        ];
    return candidates.filter(([c, r]) =>
      c >= 0 && c < this.cols && r >= 0 && r < this.rows
    );
  }
}
