import { CELL_SIZE, cellTypesArr, COLORS, PLAYER_RADIUS, svgNamespace } from "./lib/constants";
import { checkLineIntersectsCircle } from "./lib/helperFns";
import { mazes } from "./lib/mazes";
import type { CellLines, CellType, MazeBlueprint } from "./lib/types";

const queryParams = Object.fromEntries(new URLSearchParams(location.search).entries());
const mazeIdx = Number(queryParams.maze);
const mazeBlueprint = mazes[mazeIdx];
const mazeCells: Cell[][] = [];

const canvas = document.querySelector("#canvas") as SVGSVGElement;
const loopBtn = document.querySelector("#loop-btn") as HTMLButtonElement;

const keyMap: { [k: string]: boolean } = {
  w: false,
  ArrowUp: false,
  a: false,
  ArrowLeft: false,
  s: false,
  ArrowDown: false,
  d: false,
  ArrowRight: false,
};

const wallCollision: { [k: string]: boolean } = {
  top: false,
  right: false,
  bottom: false,
  left: false,
  tl: false,
  tr: false,
  bl: false,
  br: false,
};

abstract class Updatable {
  update(deltaTime: number) {}
}

class Player implements Updatable {
  id = "player";
  svg: SVGCircleElement;
  speed = 0.15;
  x: number;
  y: number;
  currCell: Cell;

  constructor(row: number, col: number) {
    this.x = col * CELL_SIZE + CELL_SIZE / 2;
    this.y = row * CELL_SIZE + CELL_SIZE / 2;

    this.currCell = mazeCells[row][col];

    this.svg = document.createElementNS(svgNamespace, "circle");
    this.svg.setAttribute("r", PLAYER_RADIUS + "px");
    this.svg.setAttribute("fill", "blue");
    canvas.append(this.svg);

    this.setPos(this.x, this.y);

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      keyMap[e.key] = true;
    });
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      keyMap[e.key] = false;
    });
  }

  setPos(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.svg.setAttribute("cx", x + "px");
    this.svg.setAttribute("cy", y + "px");

    this.determineCurrCell();
  }

  determineCurrCell() {
    const row = Math.trunc(this.y / CELL_SIZE);
    const col = Math.trunc(this.x / CELL_SIZE);
    // console.log("determineCurrCell", this.currCell);
    if (row !== this.currCell.row || col !== this.currCell.col) {
      const cell = mazeCells?.[row]?.[col];
      if (cell) {
        this.currCell = cell;
        console.log(this.currCell);
      }
    }
  }

  update(deltaTime: number): void {
    const up = keyMap.w || keyMap.ArrowUp;
    const right = keyMap.d || keyMap.ArrowRight;
    const down = keyMap.s || keyMap.ArrowDown;
    const left = keyMap.a || keyMap.ArrowLeft;

    // console.log("player update", deltaTime, { up, right, down, left });

    let dx = 0;
    let dy = 0;

    if (up) dy -= this.speed * deltaTime;
    if (right) dx += this.speed * deltaTime;
    if (down) dy += this.speed * deltaTime;
    if (left) dx -= this.speed * deltaTime;

    if ((up && right) || (up && left) || (down && right) || (down && left)) {
      dx *= 0.75;
      dy *= 0.75;
    }

    this.setPos(this.x + dx, this.y + dy);

    console.log("currCell", this.currCell);
    console.log("neighbors", Cell.getNeighbors(this.currCell));

    // const playerCircle = { cx: this.x, cy: this.y, r: PLAYER_RADIUS };

    // wallCollision.top = checkLineIntersectsCircle(this.currCell.lines.top, playerCircle);
    // wallCollision.right = checkLineIntersectsCircle(this.currCell.lines.right, playerCircle);
    // wallCollision.bottom = checkLineIntersectsCircle(this.currCell.lines.bottom, playerCircle);
    // wallCollision.left = checkLineIntersectsCircle(this.currCell.lines.left, playerCircle);

    // wallCollision.tl = wallCollision.top && wallCollision.left;
    // wallCollision.tr = wallCollision.top && wallCollision.right;
    // wallCollision.bl = wallCollision.bottom && wallCollision.left;
    // wallCollision.br = wallCollision.bottom && wallCollision.right;

    // console.log(wallCollision);
  }
}

class Cell {
  row: number;
  col: number;
  x: number;
  y: number;
  rect: SVGRectElement;
  lines: CellLines;
  type: CellType;

  constructor(row: number, col: number, typeNum: number) {
    this.row = row;
    this.col = col;
    this.x = col * CELL_SIZE;
    this.y = row * CELL_SIZE;
    this.type = cellTypesArr[typeNum];

    this.rect = document.createElementNS(svgNamespace, "rect");
    this.rect.dataset["col"] = String(this.col);
    this.rect.dataset["row"] = String(this.row);

    this.rect.setAttribute("x", this.col * CELL_SIZE + "px");
    this.rect.setAttribute("y", this.row * CELL_SIZE + "px");
    this.rect.setAttribute("width", CELL_SIZE + "px");
    this.rect.setAttribute("height", CELL_SIZE + "px");
    this.rect.setAttribute("stroke", "black");
    this.rect.setAttribute("fill", COLORS[this.type]);

    this.lines = {
      top: { ax: this.x, ay: this.y, bx: this.x + CELL_SIZE, by: this.y },
      right: { ax: this.x + CELL_SIZE, ay: this.y, bx: this.x + CELL_SIZE, by: this.y + CELL_SIZE },
      bottom: { ax: this.x, ay: this.y + CELL_SIZE, bx: this.x + CELL_SIZE, by: this.y + CELL_SIZE },
      left: { ax: this.x, ay: this.y, bx: this.x, by: this.y + CELL_SIZE },
    };

    this.rect.addEventListener("click", () => {
      console.log("clicked cell", this);
    });
  }

  static getNeighbors(cell: Cell) {
    return {
      top: mazeCells?.[cell.row - 1]?.[cell.col] ?? null,
      right: mazeCells?.[cell.row]?.[cell.col + 1] ?? null,
      bottom: mazeCells?.[cell.row + 1]?.[cell.col] ?? null,
      left: mazeCells?.[cell.row]?.[cell.col - 1] ?? null,
      tr: mazeCells?.[cell.row - 1]?.[cell.col + 1] ?? null,
      tl: mazeCells?.[cell.row - 1]?.[cell.col - 1] ?? null,
      br: mazeCells?.[cell.row + 1]?.[cell.col + 1] ?? null,
      bl: mazeCells?.[cell.row + 1]?.[cell.col - 1] ?? null,
    };
  }
}

class Loop {
  frameId;
  isPlaying = false;
  timestamp = Date.now();
  updatables: Updatable[] = [];

  constructor() {
    this.frameId = -1;
  }

  start() {
    this.isPlaying = true;
    this.timestamp = Date.now();
    this.tick();
  }

  stop() {
    this.isPlaying = false;
    cancelAnimationFrame(this.frameId);
  }

  tick() {
    const deltaTime = Date.now() - this.timestamp;
    // console.log("tick", this.frameId, deltaTime);

    for (const updatable of this.updatables) {
      updatable.update(deltaTime);
    }

    this.timestamp = Date.now();
    this.frameId = requestAnimationFrame(this.tick.bind(this));
  }
}

class Game {
  loop;
  player;

  constructor() {
    this.loop = new Loop();

    // initialize cells, append them to canvas
    this.buildGrid();

    // initialize player
    const initialPos = { row: 0, col: 0 };
    this.player = new Player(initialPos.row, initialPos.col);

    // append loop btn listeners
    loopBtn.addEventListener("click", () => {
      if (this.loop.isPlaying) {
        loopBtn.textContent = "Play";
        this.pause();
      } else {
        loopBtn.textContent = "Pause";
        this.start();
      }
    });

    // add player to loop.updatables
    this.loop.updatables.push(this.player);
    console.log(this);
  }

  buildGrid() {
    for (let row = 0; row < mazeBlueprint.length; row++) {
      mazeCells[row] = [];
      for (let col = 0; col < mazeBlueprint[row].length; col++) {
        const cell = new Cell(row, col, mazeBlueprint[row][col]);
        mazeCells[row].push(cell);
        canvas.append(cell.rect);
      }
    }
    console.log(mazeCells);
  }

  start() {
    this.loop.start();
  }

  pause() {
    this.loop.stop();
  }
}

const game = new Game();
game.start();
