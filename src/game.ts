import { CELL_SIZE, cellTypesArr, COLORS, PLAYER_RADIUS, svgNamespace } from "./lib/constants";
import { checkLineIntersectsCircle } from "./lib/helperFns";
import { mazes } from "./lib/mazes";
import type { CellLines, CellType, MazeBlueprint } from "./lib/types";

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
  speed = 0.1;
  x: number;
  y: number;
  currCellPos: [number, number] = [-1, -1];
  private currCell: Cell;

  constructor(x: number, y: number, cell: Cell) {
    this.x = x;
    this.y = y;
    this.currCell = cell;

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      keyMap[e.key] = true;
    });
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      keyMap[e.key] = false;
    });

    this.svg = document.createElementNS(svgNamespace, "circle");
    this.svg.setAttribute("r", PLAYER_RADIUS + "px");
    this.svg.setAttribute("fill", "blue");

    this.setPos(x, y);

    canvas.append(this.svg);
  }

  setPos(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.svg.setAttribute("cx", x + "px");
    this.svg.setAttribute("cy", y + "px");
  }

  getCurrCellPos() {
    const row = Math.trunc(this.x / CELL_SIZE);
    const col = Math.trunc(this.y / CELL_SIZE);

    if (row !== this.currCellPos[0] || col !== this.currCellPos[1]) {
      this.onCellPosChanged(row, col);
    }
  }

  onCellPosChanged(row: number, col: number) {
    this.currCellPos = [row, col];
    document.dispatchEvent(new CustomEvent("player-cell", { detail: [row, col] }));
  }

  setCurrCell(cell: Cell) {
    this.currCell = cell;
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

    this.getCurrCellPos();

    const playerCircle = { cx: this.x, cy: this.y, r: PLAYER_RADIUS };

    wallCollision.top = checkLineIntersectsCircle(this.currCell.lines.top, playerCircle);
    wallCollision.right = checkLineIntersectsCircle(this.currCell.lines.right, playerCircle);
    wallCollision.bottom = checkLineIntersectsCircle(this.currCell.lines.bottom, playerCircle);
    wallCollision.left = checkLineIntersectsCircle(this.currCell.lines.left, playerCircle);

    wallCollision.tl = wallCollision.top && wallCollision.left;
    wallCollision.tr = wallCollision.top && wallCollision.right;
    wallCollision.bl = wallCollision.bottom && wallCollision.left;
    wallCollision.br = wallCollision.bottom && wallCollision.right;

    console.log(wallCollision);
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
  mazeBlueprint: MazeBlueprint;
  cells: Cell[] = [];

  constructor() {
    this.mazeBlueprint = this.loadMaze();
    this.loop = new Loop();

    // initialize cells, append them to canvas
    for (let row = 0; row < this.mazeBlueprint.length; row++) {
      for (let col = 0; col < this.mazeBlueprint[row].length; col++) {
        const cell = new Cell(row, col, this.mazeBlueprint[row][col]);
        this.cells.push(cell);
        canvas.append(cell.rect);
      }
    }

    // initialize player
    const initialPos = { row: 1, col: 0 };
    const initialCell = this.cells.find((c) => c.row === initialPos.row && c.col === initialPos.col);
    if (!initialCell) throw Error("failed to find initial cell");

    const playerX = initialPos.col * CELL_SIZE + CELL_SIZE / 2;
    const playerY = initialPos.row * CELL_SIZE + CELL_SIZE / 2;

    this.player = new Player(playerX, playerY, initialCell);

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

    // listen to player cell changes
    document.addEventListener("player-cell", (ev) => {
      console.log("ev", ev);
      const [x, y] = (ev as any).detail;
      const playerCell = this.cells.find((c) => c.row === y && c.col === x);
      if (!playerCell) throw Error("failed to find player cell");
      this.player.setCurrCell(playerCell);
    });

    // add  player to loop.updatables
    this.loop.updatables.push(this.player);
    console.log(this);
  }

  loadMaze() {
    const queryParams = Object.fromEntries(new URLSearchParams(location.search).entries());
    const mazeIdx = Number(queryParams.maze);
    return mazes[mazeIdx];
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
// const loop = new Loop();

// loop.start();
