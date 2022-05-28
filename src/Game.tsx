import { Component } from 'react';
import './Game.css';
import Tile from './Tile';
import nextId from 'react-id-generator';
export type Point = {
  x: number;
  y: number;
}
type GameProps = {}
type Tile = {
  value: number,
  fromPos: Point | null,
  merged: boolean,
  newTile: boolean
}
type State = {
  placedTiles: number,
  board: Tile[][],
};

class Game extends Component<GameProps, State> {
  private colorPalette: { [key: number]: { background: string, color: string } } = {
    0: { background: 'inherit', color: 'inherit' },
    2: { background: '#EEE4DA', color: 'inherit' },
    4: { background: '#EDE0C8', color: 'inherit' },
    8: { background: '#F2B179', color: '#f9f6f2' },
    16: { background: '#F59563', color: '#f9f6f2' },
    32: { background: '#F67C5F', color: '#f9f6f2' },
    64: { background: '#F65E3B', color: '#f9f6f2' },
    128: { background: '#EDCF72', color: '#f9f6f2' },
    256: { background: '#EDCC61', color: '#f9f6f2' },
    512: { background: '#EDC850', color: '#f9f6f2' },
    1024: { background: '#EDC53F', color: '#f9f6f2' },
    2048: { background: '#EDC22E', color: '#f9f6f2' },
    // 4096: { background: '#3E3933', color: '#f9f6f2' },
    // 8192: { background: '#F47C7C', color: '#f9f6f2' },
    // 16384: { background: '#4C5B61', color: '#f9f6f2' },
    // 32768: { background: '#9772FB', color: '#f9f6f2' },
    // 65536: { background: '#E9EFC0', color: '#f9f6f2' },
    // 131072: { background: '#0AA1DD', color: '#f9f6f2' },
  }
  private startValues = [2, 4];
  private N = 4;
  private emptyTile = {
    value: 0,
    fromPos: null,
    merged: false,
    newTile: false
  }

  private initState: State;
  constructor(props: any) {
    super(props);
    this.initState = {
      placedTiles: 0,
      board: this.createInitBoard()
    };
    this.state = this.initState;

  }
  createInitBoard = () => {
    const m: Tile[][] = Array.from({ length: this.N }).map(() => Array.from<Tile>({ length: this.N }));
    for (let x = 0; x < this.N; x++) {
      for (let y = 0; y < this.N; y++) {
        m[x][y] = {
          ...this.emptyTile,
          fromPos: { x, y }
        }
      }
    }
    return m;
  }

  getRandomValue = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
  }
  copyBoard = (board: Tile[][]) => {
    return board.map((row) => {
      return row.slice();
    })
  }
  placeNewTiles = (nbrOfnewTiles: number) => {
    this.setState((prevState) => {
      const { board, placedTiles } = prevState;
      const n = this.N;
      const values = this.startValues;
      let tiles = placedTiles;
      const newBoard = this.copyBoard(board);
      for (let i = 0; i < nbrOfnewTiles; i++) {
        if (tiles >= n * n) {
          break;
        }
        const value = values[this.getRandomValue(0, 2)];
        let x = this.getRandomValue(0, n);
        let y = this.getRandomValue(0, n);
        while (newBoard[x][y].value !== 0) {
          x = this.getRandomValue(0, n);
          y = this.getRandomValue(0, n);
        }
        newBoard[x][y] = {
          ...this.emptyTile,
          value,
          newTile: true,
          fromPos: { x, y }
        };
        tiles++;
      }
      const result = { board: newBoard, placedTiles: tiles };
      return result;
    });
  }
  private transposeMatrix = (m: Tile[][]) => {
    const newMatrix = Array.from({ length: m.length }).map(() => Array.from<Tile>({ length: m.length }));
    for (let r = 0; r < this.N; r++) {
      for (let c = 0; c < this.N; c++) {
        newMatrix[c][r] = m[r][c]
      }
    }
    return newMatrix;
  }

  horizontalSlide = (board: Tile[][], placedTiles: number) => {
    const n = this.N;
    let newBoard = this.copyBoard(board);
    let tiles = placedTiles;
    const mergedTiles: Point[] = [];
    newBoard = newBoard.map((row, rowIdx) => {
      const filtered = row.filter(e => e.value !== 0);
      if (filtered.length === 0) {
        return row;
      }
      const newRow = Array.from<Tile>({ length: n }).fill(this.emptyTile);
      if (filtered.length === 1) {
        newRow[0] = filtered[0];
        return newRow;
      }
      let idx = 0;
      newRow[0] = filtered[0];
      for (let i = 1; i < filtered.length; i++) {
        const val = filtered[i].value;
        if (val === newRow[idx].value) {
          newRow[idx] = {
            ...newRow[idx],
            value: newRow[idx].value + val,
            merged: true,
          };
          tiles--;
          idx++;
          continue;
        }
        if (newRow[idx].value !== 0) {
          idx++;
        }
        newRow[idx] = filtered[i];
      }
      return newRow;
    });
    return { board: newBoard, placedTiles: tiles };
  }
  calculateMovingCoordinates = (from: Point | null, to: Point): Point => {
    const cellWidth = 106.25;
    const cellPadding = 15;
    let x = 0;
    let y = 0;
    if (!from) {
      return { x, y }
    }
    if (from.x === to.x) {
      x = (to.y - from.y) * (cellWidth + cellPadding);
    }
    if (from.y === to.y) {
      y = (to.x - from.x) * (cellWidth + cellPadding);
    }
    return { x, y };
  }
  clearAnimationProperties = (board: Tile[][]): Tile[][] => {
    const newBoard = this.copyBoard(board);
    const n = this.N;
    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        const tile = newBoard[x][y];
        tile.newTile = false;
        tile.merged = false;
        tile.fromPos = { x, y };
      }
    }
    return newBoard;
  }

  handleKeyPress = (event: any) => {
    let newState = true;
    this.setState((prevState) => {
      const { board, placedTiles } = prevState;
      const clearedBoard = this.clearAnimationProperties(board);
      switch (event.key) {
        case "ArrowUp": {
          const transposedBoard = this.transposeMatrix(clearedBoard);
          const result = this.horizontalSlide(transposedBoard, placedTiles);
          const newBoard = this.transposeMatrix(result.board);
          return { board: newBoard, placedTiles: result.placedTiles };
        }
        case "ArrowDown": {
          const transposedBoard = this.transposeMatrix(clearedBoard);
          const result = this.horizontalSlide(transposedBoard, placedTiles);
          const newBoard = result.board.map(row => {
            const newRow = Array.from<Tile>({ length: this.N }).fill(this.emptyTile);
            let j = row.length - 1;
            for (let i = row.length - 1; i >= 0; i--) {
              if (row[i].value !== 0) {
                newRow[j] = row[i];
                j--;
              }
            }
            return newRow;
          });
          const transposedNewBoard = this.transposeMatrix(newBoard);
          return { board: transposedNewBoard, placedTiles: result.placedTiles };
        }
        case "ArrowLeft":
          return this.horizontalSlide(board, placedTiles);
        case "ArrowRight":
          const result = this.horizontalSlide(clearedBoard, placedTiles);
          const newBoard = result.board.map(row => {
            const newRow = Array.from<Tile>({ length: this.N }).fill(this.emptyTile);
            let j = row.length - 1;
            for (let i = row.length - 1; i >= 0; i--) {
              if (row[i].value !== 0) {
                newRow[j] = row[i];
                j--;
              }
            }
            return newRow;
          });
          return { board: newBoard, placedTiles: result.placedTiles };
        default:
          newState = false;
          return prevState;
      }
    });
    if (newState) {
      this.placeNewTiles(1);
    }
  }
  componentDidMount() {
    this.placeNewTiles(2);
    window.addEventListener("keydown", this.handleKeyPress);
  }
  componentWillUnmount() {
    this.setState(this.initState);
    window.removeEventListener('keydown', this.handleKeyPress);
  }
  restartGame = () => {
    this.setState(this.initState);
    this.placeNewTiles(2);
  }
  render = () => {
    const key = 0;
    return (
      <div className='container'>
        <div>
          <header className="header">
            <h1>2048</h1>
            <button
              className='restart-button'
              onClick={this.restartGame}
            >
              New Game
            </button>
          </header>
          <div className="game-container">
            <div className="game-grid">
              {
                this.state.board.map((arr: Tile[], x: number) => {
                  return arr.map((tile: Tile, y: number) => {
                    const { color, background } = this.colorPalette[tile.value];
                    return (
                      <div key={nextId()} className='grid-cell'>
                        <Tile newTile={tile.newTile} mergedTile={tile.merged} textColor={color} background={background}>
                          {tile.value ? String(tile.value) : null}
                        </Tile>
                      </div>
                    )
                  });
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Game;
