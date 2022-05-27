import React, { Component } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import './App.css';
import { Button } from '@mui/material';

type Props = {
  children: string | null,
  textColor: string,
  background: string
};

function Tile(props: Props) {
  const { textColor, background, ...other } = props
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 106.25,
        height: 106.25,
        background: background,
        p: 1,
        m: 1,
        fontSize: '55px',
        fontWeight: 'bold',
        margin: '2px',
        color: textColor,
      }}
      {...other}
    />
  );
}
type GameProps = {}

type State = {
  placedTiles: number,
  board: number[][]
};

class Game extends Component<GameProps, State> {
  private colorPalette: { [key: number]: { background: string, color: string } } = {
    0: { background: '#EEE4DA', color: 'inherit' },
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
  private initState = {
    placedTiles: 0,
    board: Array.from({ length: 4 }).map(() => Array.from<number>({ length: 4 }).fill(0))
  };
  constructor(props: any) {
    super(props);
    this.state = this.initState;
  }
  getRandomValue = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
  }
  copyBoard = (board: number[][]) => {
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
          alert("no more move");
          break;
        }
        const value = values[this.getRandomValue(0, 2)];
        let row = this.getRandomValue(0, n);
        let col = this.getRandomValue(0, n);
        while (newBoard[row][col] !== 0) {
          row = this.getRandomValue(0, n);
          col = this.getRandomValue(0, n);
        }
        newBoard[row][col] = value;
        tiles++;
      }
      return { ...prevState, board: newBoard, placedTiles: tiles };
    });
  }
  private transposeMatrix = (m: number[][]) => {
    const newMatrix = Array.from({ length: m.length }).map(() => Array.from<number>({ length: m.length }).fill(0));
    for (let r = 0; r < this.N; r++) {
      for (let c = 0; c < this.N; c++) {
        newMatrix[c][r] = m[r][c]
      }
    }
    return newMatrix;
  }

  horizontalSlide = (board: number[][], placedTiles: number) => {
    const n = this.N;
    // this.setState((prevState) => {
    //   const { board, placedTiles } = prevState;
    let newBoard = this.copyBoard(board);
    let tiles = placedTiles;
    newBoard = newBoard.map(row => {
      const filtered = row.filter(e => e !== 0);
      if (filtered.length === 0) {
        return row;
      }
      const newRow = Array.from<number>({ length: n }).fill(0);
      if (filtered.length === 1) {
        newRow[0] = filtered[0];
        return newRow
      }
      let idx = 0;
      newRow[0] = filtered[0];
      for (let i = 1; i < filtered.length; i++) {
        const val = filtered[i];
        if (val === newRow[idx]) {
          newRow[idx] += val;
          tiles--;
          idx++;
          continue;
        }
        if (newRow[idx] !== 0) {
          idx++;
        }
        newRow[idx] = val;
      }
      return newRow;
    });
    return { board: newBoard, placedTiles: tiles };
    // });

  }
  moveUp() {
    this.setState((prevState) => {
      const { board, placedTiles } = prevState;
      const transposedBoard = this.transposeMatrix(board);
      const result = this.horizontalSlide(transposedBoard, placedTiles);
      const newBoard = this.transposeMatrix(result.board);
      return { board: newBoard, placedTiles: result.placedTiles };
    });

  }
  moveDown() {
    this.setState((prevState) => {
      const { board, placedTiles } = prevState;
      console.log("before", board);
      const transposedBoard = this.transposeMatrix(board);
      console.log("transposedBoard", transposedBoard);
      const result = this.horizontalSlide(transposedBoard, placedTiles);
      console.log("result", result);
      const newBoard = result.board.map(row => {
        const newRow = Array.from<number>({ length: this.N }).fill(0);
        let j = row.length - 1;
        for (let i = row.length - 1; i >= 0; i--) {
          if (row[i] !== 0) {
            newRow[j] = row[i];
            j--;
          }
        }
        return newRow;
      });
      console.log("shift right", newBoard);
      const transposedNewBoard = this.transposeMatrix(newBoard);
      console.log("transposedNewBoard", transposedNewBoard);
      return { board: transposedNewBoard, placedTiles: result.placedTiles };
    });

  }

  moveLeft = () => {
    this.setState((prevState) => {
      const { board, placedTiles } = prevState;
      return this.horizontalSlide(board, placedTiles);
    });

  }

  moveRight = () => {
    this.setState((prevState) => {
      const { board, placedTiles } = prevState;
      const result = this.horizontalSlide(board, placedTiles);
      const newBoard = result.board.map(row => {
        const newRow = Array.from<number>({ length: this.N }).fill(0);
        let j = row.length - 1;
        for (let i = row.length - 1; i >= 0; i--) {
          if (row[i] !== 0) {
            newRow[j] = row[i];
            j--;
          }
        }
        return newRow;
      });
      return { board: newBoard, placedTiles: result.placedTiles };
    });


  }
  handleKeyPress = (event: any) => {
    console.log(event.key)
    switch (event.key) {
      case "ArrowUp":
        this.moveUp();
        this.placeNewTiles(1);
        break;
      case "ArrowDown":
        this.moveDown();
        this.placeNewTiles(1);
        break;
      case "ArrowLeft":
        this.moveLeft();
        this.placeNewTiles(1);
        break;
      case "ArrowRight":
        this.moveRight();
        this.placeNewTiles(1);
        break;
      default:
        break;
    }

  }
  componentDidMount() {
    console.log("called");
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
    console.log(this.state);
    return (
      <Container
        sx={{
          width: 600,
          marginTop: "30px"
        }}
      >
        <div>
          <header className="header">
            <h1>2048</h1>
            <Button
              variant="contained"
              style={{ backgroundColor: "#8f7a66", fontFamily: "inherit", color: "#f9f6f2", fontWeight: 'bold' }}
              disableRipple={true}
              onClick={this.restartGame}>New Game</Button>
          </header>
          <div className="game-container">

            <Grid
              display="grid"
              margin="auto"
              columnGap={0.7}
              rowGap={0.7}
              gridTemplateColumns="repeat(4, 0fr)"
              gridTemplateRows="repeat(4, 0fr)"
            >
              {
                this.state.board.map((arr: number[], row: number) => {
                  return arr.map((val: number, col: number) => {
                    const { color, background } = this.colorPalette[val];
                    return (<Grid key={`${row}-${col}`} width="100%" item xs={4} style={{
                      background: 'rgba(238, 228, 218, 0.35)',
                      borderRadius: 0
                    }}>
                      <Tile textColor={color} background={background}  >{val ? String(val) : null}</Tile>
                    </Grid>)
                  });
                })
              }
            </Grid>

          </div>
        </div>

      </Container >
    );
  }
}

export default Game;
