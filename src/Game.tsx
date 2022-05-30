import { Component } from 'react';
import './Game.css';
import Tile from './Tile';
import nextId from 'react-id-generator';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, COLOR_PALETTE, MAX_LEVEL } from './constants';
import MessageComponent, { Message } from './GameMessage';
import TileComponent from './Tile';
export type Point = {
  x: number;
  y: number;
}
type Cell = {
  r: number;
  c: number;
}
type GameProps = {}
type Tile = {
  value: number,
  oldPos: Cell | null,
  merged: boolean,
  newTile: boolean
}
type State = {
  placedTiles: number,
  board: Tile[][],
  nextLevel: number,
  message: Message | null;
};

class Game extends Component<GameProps, State> {
  private N = 4;
  private emptyTile = {
    value: 0,
    oldPos: null,
    merged: false,
    newTile: false
  }
  private gameOverMessage: Message;
  private initState: State;
  constructor(props: any) {
    super(props);
    this.initState = {
      placedTiles: 0,
      board: this.createInitBoard(),
      nextLevel: 32,
      message: null
    };
    this.state = this.initState;
    this.gameOverMessage = {
      onClick: this.restartGame,
      messageText: "Game Over!",
      buttonLabel: "Try again"
    }
  }
  private touchStartPoint: Point | null = null;
  private touchEndPoint: Point | null = null;
  createInitBoard = () => {
    const m: Tile[][] = Array.from({ length: this.N }).map(() => Array.from<Tile>({ length: this.N }));
    for (let r = 0; r < this.N; r++) {
      for (let c = 0; c < this.N; c++) {
        m[r][c] = this.emptyTile;
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
    });
  }
  placeNewTiles = (nbrOfnewTiles: number) => {
    this.setState((prevState) => {
      let { board, placedTiles } = prevState;
      const n = this.N;
      const newBoard = this.copyBoard(board);
      for (let i = 0; i < nbrOfnewTiles; i++) {
        if (placedTiles >= n * n) {
          break;
        }
        const value = Math.random() < 0.5 ? 2 : 4;
        let r: number;
        let c: number;
        do {
          r = this.getRandomValue(0, n);
          c = this.getRandomValue(0, n);
        } while (newBoard[r][c].value !== 0);
        newBoard[r][c] = {
          ...this.emptyTile,
          value,
          newTile: true,
          oldPos: { r, c }
        };
        placedTiles++;
      }
      let message = prevState.message;
      // Win message has higher priority
      if (placedTiles >= n * n && !prevState.message && this.isGameOver(newBoard)) {
        message = this.gameOverMessage;
      }
      return { ...prevState, board: newBoard, placedTiles, message };
    });
  }
  isGameOver = (board: Tile[][]) => {
    const n = board.length;
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board.length; c++) {
        const val = board[r][c].value;
        if (val === 0) {
          return false;
        };
        if (r + 1 < n && board[r + 1][c].value === val) {
          return false;
        }
        if (c + 1 < n && board[r][c + 1].value === val)
          return false
      }
    }
    return true;
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
  //Calculate the distance to move tile from old position to the new position
  calculateMovingPixels = (from: Cell | null, to: Cell): Point => {
    const cellWidth = 106.25;
    const cellPadding = 15;
    const step = cellWidth + cellPadding;
    let x = 0;
    let y = 0;
    if (!from) {
      return { x, y }
    }
    if (from.r === to.r) {
      x = (from.c - to.c) * step;
    }
    if (from.c === to.c) {
      y = (from.r - to.r) * step;
    }
    return { x, y };
  }
  clearAnimationProperties = (board: Tile[][]): Tile[][] => {
    const newBoard = this.copyBoard(board);
    const n = this.N;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const tile = newBoard[r][c];
        tile.newTile = false;
        tile.merged = false;
        tile.oldPos = tile.value === 0 ? null : { r, c };
      }
    }
    return newBoard;
  }
  checkScore = (score: number, nextLevel: number): Message | null => {
    if (score === MAX_LEVEL) {
      return {
        onClick: this.restartGame,
        messageText: "You won!",
        buttonLabel: "Try again"
      };
    }
    if (score >= nextLevel) {
      return {
        onClick: () => {
          this.setState((prevState) => {
            const clearedBoard = this.clearAnimationProperties(prevState.board);
            return { ...prevState, board: clearedBoard, message: null, nextLevel: nextLevel * 2 };
          });
        },
        messageText: `New milestone reached! ${nextLevel}`,
        buttonLabel: "Continue"
      }
    }
    return null;
  }

  swipeLeft = (board: Tile[][], placedTiles: number) => {
    const n = board.length;
    let tiles = placedTiles;
    let largestTile = 0;
    const newBoard = this.copyBoard(board).map((row) => {
      let count = 0;
      for (let c = 1; c < n; c++) {
        if (row[c].value === 0) continue;
        if (row[count].value !== 0) {
          if (row[count].value === row[c].value) {
            row[count] = {
              newTile: false,
              value: row[c].value * 2,
              merged: true,
              oldPos: row[c].oldPos
            }
            largestTile = Math.max(largestTile, row[count].value);
            tiles--;
            count++;
            row[c] = this.emptyTile;
          } else {
            count++;
            row[count] = { ...row[c] };
            if (count !== c) {
              row[c] = this.emptyTile;
            }
          }
        } else {
          row[count] = { ...row[c] };
          row[c] = this.emptyTile;
        }
      }
      return row;
    });
    return { board: newBoard, placedTiles: tiles, largestTile };
  }
  swipeRight = (board: Tile[][], placedTiles: number) => {
    const reversedBoard = this.copyBoard(board).map((row) => {
      return row.reverse();
    });
    const swipedLeft = this.swipeLeft(reversedBoard, placedTiles);
    const newBoard = swipedLeft.board.map((row) => {
      return row.reverse();
    });
    return { board: newBoard, placedTiles: swipedLeft.placedTiles, largestTile: swipedLeft.largestTile };
  }
  handleKeyPress = (event: any) => {
    const events = [ARROW_LEFT, ARROW_RIGHT, ARROW_UP, ARROW_DOWN];
    if (!events.includes(event.key) || this.state.message) return;
    this.updateGameBoard(event.key);
  }
  updateGameBoard = (direction: string) => {
    let newState = true;
    this.setState((prevState) => {
      const { board, placedTiles, nextLevel } = prevState;
      const clearedBoard = this.clearAnimationProperties(board);
      switch (direction) {
        case ARROW_LEFT: {
          const result = this.swipeLeft(board, placedTiles);
          const message = this.checkScore(result.largestTile, nextLevel);
          return { ...prevState, board: result.board, placedTiles: result.placedTiles, message };
        }
        case ARROW_RIGHT:
          const result = this.swipeRight(board, placedTiles);
          const message = this.checkScore(result.largestTile, nextLevel);
          return { ...prevState, board: result.board, placedTiles: result.placedTiles, message }
        case ARROW_UP: {
          const transposedBoard = this.transposeMatrix(clearedBoard);
          const result = this.swipeLeft(transposedBoard, placedTiles);
          const newBoard = this.transposeMatrix(result.board);
          const message = this.checkScore(result.largestTile, nextLevel);
          return { ...prevState, board: newBoard, placedTiles: result.placedTiles, message };
        }
        case ARROW_DOWN: {
          const transposedBoard = this.transposeMatrix(clearedBoard);
          const result = this.swipeRight(transposedBoard, placedTiles);
          const transposedNewBoard = this.transposeMatrix(result.board);
          const message = this.checkScore(result.largestTile, nextLevel);
          return { ...prevState, board: transposedNewBoard, placedTiles: result.placedTiles, message };
        }
        default:
          newState = false;
          return prevState;
      }
    });
    if (newState) {
      this.placeNewTiles(1);
    }
  }
  handleTouchStart = (event: TouchEvent) => {
    this.touchStartPoint = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    this.touchEndPoint = null;
  }
  handleTouchEnd = (event: TouchEvent) => {
    if (this.state.message) return;
    const minDistance = 50;
    this.touchEndPoint = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }
    if (!this.touchStartPoint || !this.touchEndPoint) return;
    const signedDeltaX = this.touchEndPoint.x - this.touchStartPoint.x;
    const signedDeltaY = this.touchEndPoint.y - this.touchStartPoint.y;
    const deltaX = Math.abs(signedDeltaX);
    const deltaY = Math.abs(signedDeltaY);
    if (deltaX < minDistance && deltaY < minDistance) return;
    //Horizontal swipe
    if (deltaX > deltaY) {
      if (signedDeltaX < 0) {
        this.updateGameBoard(ARROW_LEFT);
      } else {
        this.updateGameBoard(ARROW_RIGHT);
      }
      // Vertical swipe
    } else {
      if (signedDeltaY < 0) {
        this.updateGameBoard(ARROW_UP);
      } else {
        this.updateGameBoard(ARROW_DOWN);
      }
    }
  }
  componentDidMount() {
    this.placeNewTiles(2);
    window.addEventListener("keydown", this.handleKeyPress);
    window.addEventListener("touchstart", this.handleTouchStart);
    window.addEventListener("touchend", this.handleTouchEnd);
  }
  componentWillUnmount() {
    this.setState(this.initState);
    window.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener("touchend", this.handleTouchEnd);
  }
  restartGame = () => {
    this.setState(this.initState);
    this.placeNewTiles(2);
  }
  render = () => {
    const { message } = this.state;
    return (
      <div className='container'>
        <div>
          <header className="header">
            <h1>2048</h1>
            <button
              className='game-button'
              onClick={this.restartGame}
            >
              New Game
            </button>
          </header>
          <div className="game-container">
            {message ? (<MessageComponent
              messageText={message.messageText}
              buttonLabel={message.buttonLabel}
              onClick={message.onClick}
            />) : null
            }
            <div className="game-grid">

              {
                this.state.board.map((arr: Tile[], r: number) => {
                  return arr.map((tile: Tile, c: number) => {
                    const { color, background } = COLOR_PALETTE[tile.value];
                    const point = this.calculateMovingPixels(tile.oldPos, { r, c });
                    return (
                      <div key={nextId()} className="grid-cell">
                        <TileComponent newTile={tile.newTile} mergedTile={tile.merged} textColor={color} background={background} transform={point}>
                          {tile.value ? String(tile.value) : null}
                        </TileComponent>
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
