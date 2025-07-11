import {
    CELL_SIZE,
    cellTypesArr,
    COIN_RADIUS,
    COLORS,
    ENEMY_RADIUS,
    oppositeDirections,
    PLAYER_RADIUS,
    POWER_UP_RADIUS,
    svgNamespace,
} from "../lib/constants";
import { checkLineIntersectsCircle, getDistance, randRange } from "../lib/helperFns";
import { mazes } from "../lib/mazes";
import { CellType, Direction, DirectionDiag, GameItem, type CellLines, type MazeBlueprint } from "../lib/types";

const queryParams = Object.fromEntries(new URLSearchParams(location.search).entries());
const mazeIdx = Number(queryParams.maze);
const mazeBlueprint = mazes[mazeIdx];
const mazeCells: Cell[][] = [];
const cellItems: Partial<Record<CellType, GameItem>> = {
    [CellType.ground]: GameItem.coin,
    [CellType.powerUp]: GameItem.powerUp,
};

const canvas = document.querySelector("#canvas") as SVGSVGElement;
const loopBtn = document.querySelector("#loop-btn") as HTMLButtonElement;

canvas.style.height = mazeBlueprint.length * CELL_SIZE + "px";
canvas.style.width = mazeBlueprint[0].length * CELL_SIZE + "px";

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

const wallCollision: Record<DirectionDiag, boolean> = {
    top: false,
    right: false,
    bottom: false,
    left: false,
    tl: false,
    tr: false,
    bl: false,
    br: false,
};

interface Updatable {
    update(deltaTime: number): void;
}

let enemyCounter = 0;
class Enemy implements Updatable {
    id: string;
    svg: SVGCircleElement;
    speed = 0.125;
    x: number;
    y: number;
    target: { x: number; y: number };
    direction: Direction | null = null;
    constructor(row: number, col: number) {
        this.x = col * CELL_SIZE + CELL_SIZE / 2;
        this.y = row * CELL_SIZE + CELL_SIZE / 2;
        this.target = { x: this.x, y: this.y };

        this.id = `enemy-${enemyCounter}`;
        enemyCounter++;

        this.svg = document.createElementNS(svgNamespace, "circle");
        this.svg.setAttribute("r", ENEMY_RADIUS + "px");
        this.svg.setAttribute("fill", "red");
        this.setPos(this.x, this.y);
        canvas.append(this.svg);
    }

    setPos(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.svg.setAttribute("cx", x + "px");
        this.svg.setAttribute("cy", y + "px");
    }

    private determineCurrCell() {
        const row = Math.trunc(this.y / CELL_SIZE);
        const col = Math.trunc(this.x / CELL_SIZE);
        return mazeCells?.[row]?.[col];
    }

    update(deltaTime: number): void {
        const targetDistance = getDistance(this.x, this.y, this.target.x, this.target.y);
        if (targetDistance <= 2) {
            const currCell = this.determineCurrCell();
            const neighbors = Cell.getNeighbors(currCell);

            let neighborIdx = 0;
            let reachableNeighbors = Object.entries(neighbors).filter(
                ([dir, cell]) =>
                    Object.values(Direction).includes(dir as Direction) &&
                    cell &&
                    ![CellType.door, CellType.wall].includes(cell.type)
            );

            if (!this.direction) {
                neighborIdx = randRange(0, reachableNeighbors.length - 1);
            }
            if (this.direction) {
                if (reachableNeighbors.length > 1) {
                    const oppositeDirection = oppositeDirections[this.direction];
                    reachableNeighbors = reachableNeighbors.filter(([dir, cell]) => dir !== oppositeDirection);
                }
                neighborIdx = randRange(0, reachableNeighbors.length - 1);
            }

            const [, selectedNeighborCell] = reachableNeighbors[neighborIdx];
            this.target = selectedNeighborCell!.cellCenter;
        }

        let dx = 0;
        let dy = 0;
        if (this.target.x > this.x) dx += this.speed * deltaTime;
        else if (this.target.x < this.x) dx -= this.speed * deltaTime;

        if (this.target.y > this.y) dy += this.speed * deltaTime;
        else if (this.target.y < this.y) dy -= this.speed * deltaTime;
        // console.table({ dx, dy });

        if (dx > 0 && dy == 0) this.direction = Direction.right;
        else if (dx < 0 && dy == 0) this.direction = Direction.left;
        else if (dx == 0 && dy < 0) this.direction = Direction.top;
        else if (dx == 0 && dy > 0) this.direction = Direction.bottom;

        this.setPos(this.x + dx, this.y + dy);
    }
}

class Player implements Updatable {
    id = "player";
    svg: SVGCircleElement;
    speed = 0.25;
    // speed = 0.15;
    x: number;
    y: number;
    currCell: Cell;

    constructor() {
        let row = 0;
        let col = 0;
        let doorFound = false;

        for (const line of mazeCells) {
            if (doorFound) break;
            for (const cell of line) {
                if (doorFound) break;
                if (cell.type === CellType.door) {
                    row = cell.row;
                    col = cell.col;
                    doorFound = true;
                }
            }
        }

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

    private determineCurrCell() {
        const row = Math.trunc(this.y / CELL_SIZE);
        const col = Math.trunc(this.x / CELL_SIZE);
        // console.log("determineCurrCell", this.currCell);
        if (row !== this.currCell.row || col !== this.currCell.col) {
            const cell = mazeCells?.[row]?.[col];
            if (cell) {
                this.currCell = cell;
                // console.log("cell changed ::", this.currCell);
            }
        }
    }

    handleCollectItem() {
        const cellCenter = this.currCell.cellCenter;
        const distanceToCellCenter = getDistance(this.x, this.y, cellCenter.x, cellCenter.y);
        const cellItem = this.currCell.item;
        const itemRadius = cellItem === GameItem.coin ? COIN_RADIUS : POWER_UP_RADIUS;
        if (distanceToCellCenter <= PLAYER_RADIUS + itemRadius) {
            const item = this.currCell.pluckItem();
            console.log("plucked item", item);
            return item;
        }
        return null;
    }

    update(deltaTime: number): void {
        const { dx, dy } = this.handlePlayerMovement(deltaTime);

        this.setPos(this.x + dx, this.y + dy);

        const neighbors = Cell.getNeighbors(this.currCell);

        this.updateWallCollisions(neighbors);

        // console.log({ distanceToCellCenter });
        // console.log("currCell", this.currCell);
        // console.log("neighbors", neighbors);
        // console.log("wallCollisions", wallCollision);
    }

    private handlePlayerMovement(deltaTime: number) {
        const up = keyMap.w || keyMap.ArrowUp;
        const right = keyMap.d || keyMap.ArrowRight;
        const down = keyMap.s || keyMap.ArrowDown;
        const left = keyMap.a || keyMap.ArrowLeft;

        // console.log("player update", deltaTime, { up, right, down, left });

        let dx = 0;
        let dy = 0;

        if (up) {
            if (wallCollision.top) {
                dy = 0;
            } else {
                dy -= this.speed * deltaTime;
            }
        }
        if (down) {
            if (wallCollision.bottom) {
                dy = 0;
            } else {
                dy += this.speed * deltaTime;
            }
        }
        if (left) {
            if (wallCollision.left) {
                dx = 0;
            } else {
                dx -= this.speed * deltaTime;
            }
        }
        if (right) {
            if (wallCollision.right) {
                dx = 0;
            } else {
                dx += this.speed * deltaTime;
            }
        }

        // push back
        if (wallCollision.tr) {
            dx -= this.speed * deltaTime;
            dy += this.speed * deltaTime;
        } else if (wallCollision.tl) {
            dx += this.speed * deltaTime;
            dy += this.speed * deltaTime;
        } else if (wallCollision.br) {
            dx -= this.speed * deltaTime;
            dy -= this.speed * deltaTime;
        } else if (wallCollision.bl) {
            dx += this.speed * deltaTime;
            dy -= this.speed * deltaTime;
        }

        if ((up && right) || (up && left) || (down && right) || (down && left)) {
            dx *= 0.75;
            dy *= 0.75;
        }
        return { dx, dy };
    }

    private updateWallCollisions(neighbors: Record<DirectionDiag, Cell | null>) {
        const playerCircle = { cx: this.x, cy: this.y, r: PLAYER_RADIUS };

        wallCollision.top =
            neighbors.top?.type === CellType.wall && checkLineIntersectsCircle(this.currCell.lines.top, playerCircle);
        wallCollision.right =
            neighbors.right?.type === CellType.wall &&
            checkLineIntersectsCircle(this.currCell.lines.right, playerCircle);
        wallCollision.bottom =
            neighbors.bottom?.type === CellType.wall &&
            checkLineIntersectsCircle(this.currCell.lines.bottom, playerCircle);
        wallCollision.left =
            neighbors.left?.type === CellType.wall && checkLineIntersectsCircle(this.currCell.lines.left, playerCircle);

        wallCollision.tl = Boolean(
            neighbors.tl?.type === CellType.wall &&
                checkLineIntersectsCircle(this.currCell.lines.top, playerCircle) &&
                checkLineIntersectsCircle(this.currCell.lines.left, playerCircle)
        );
        wallCollision.tr = Boolean(
            neighbors.tr?.type === CellType.wall &&
                checkLineIntersectsCircle(this.currCell.lines.top, playerCircle) &&
                checkLineIntersectsCircle(this.currCell.lines.right, playerCircle)
        );
        wallCollision.bl = Boolean(
            neighbors.bl?.type === CellType.wall &&
                checkLineIntersectsCircle(this.currCell.lines.bottom, playerCircle) &&
                checkLineIntersectsCircle(this.currCell.lines.left, playerCircle)
        );
        wallCollision.br = Boolean(
            neighbors.br?.type === CellType.wall &&
                checkLineIntersectsCircle(this.currCell.lines.bottom, playerCircle) &&
                checkLineIntersectsCircle(this.currCell.lines.right, playerCircle)
        );
    }
}

class Cell {
    row: number;
    col: number;
    x: number;
    y: number;
    lines: CellLines;
    type: CellType;
    rect: SVGRectElement;
    itemElem: SVGCircleElement | null = null;
    cellCenter = { x: 0, y: 0 };
    item: GameItem | null = null;

    constructor(row: number, col: number, type: CellType) {
        this.row = row;
        this.col = col;
        this.x = col * CELL_SIZE;
        this.y = row * CELL_SIZE;
        this.cellCenter = {
            x: this.x + CELL_SIZE / 2,
            y: this.y + CELL_SIZE / 2,
        };
        this.type = type;

        this.rect = document.createElementNS(svgNamespace, "rect");
        this.rect.dataset["col"] = String(this.col);
        this.rect.dataset["row"] = String(this.row);

        this.rect.setAttribute("x", this.col * CELL_SIZE + "px");
        this.rect.setAttribute("y", this.row * CELL_SIZE + "px");
        this.rect.setAttribute("width", CELL_SIZE + "px");
        this.rect.setAttribute("height", CELL_SIZE + "px");
        this.rect.setAttribute("stroke", [CellType.wall].includes(this.type) ? "black" : "none");
        this.rect.setAttribute(
            "fill",
            [CellType.wall, CellType.door].includes(this.type) ? COLORS[this.type] : COLORS.ground
        );

        this.item = cellItems[this.type] ?? null;
        if (this.item) {
            this.itemElem = document.createElementNS(svgNamespace, "circle");
            this.itemElem.setAttribute("cx", CELL_SIZE / 2 + this.col * CELL_SIZE + "px");
            this.itemElem.setAttribute("cy", CELL_SIZE / 2 + this.row * CELL_SIZE + "px");
            this.itemElem.setAttribute("r", this.item === GameItem.coin ? COIN_RADIUS + "px" : POWER_UP_RADIUS + "px");
            this.itemElem.setAttribute("fill", this.item === GameItem.coin ? "gold" : "dodgerblue");
        }

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

    static getNeighbors(cell: Cell): Record<DirectionDiag, Cell | null> {
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

    pluckItem() {
        const item = this.item;

        if (!item) return null;

        this.itemElem?.remove();
        this.item = null;
        this.itemElem = null;
        return item;
    }
}

let doorCounter = 0;
class Door extends Cell implements Updatable {
    id: string;
    isOpen: boolean;
    constructor(row: number, col: number) {
        super(row, col, CellType.door);
        this.id = `door-${doorCounter}`;
        doorCounter++;

        this.isOpen = true;
    }

    toggleOpen() {
        console.log("toggle open!");
        this.isOpen = !this.isOpen;

        mazeCells[this.row][this.col].type = this.isOpen ? CellType.door : CellType.wall;
        mazeCells[this.row][this.col].rect.setAttribute(
            "stroke",
            [CellType.wall].includes(this.type) ? "black" : "none"
        );
        mazeCells[this.row][this.col].rect.setAttribute(
            "fill",
            [CellType.wall, CellType.door].includes(this.type) ? COLORS[this.type] : COLORS.ground
        );
    }

    update(deltaTime: number): void {
        // console.log("door!");
        // console.log("door!", this.playerRef.x,  this.playerRef.y);
    }
}

class Loop {
    frameId;
    isPlaying = false;
    timestamp = Date.now();

    constructor() {
        this.frameId = -1;

        loopBtn.addEventListener("click", () => {
            if (this.isPlaying) {
                loopBtn.textContent = "Play";
                this.stop();
            } else {
                loopBtn.textContent = "Pause";
                this.start();
            }
        });
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

        const { player, doors, enemies } = Game.gameObjects;

        // run update method from every updatable object, like doors, player and enemy
        for (const updatable of Game.getUpdatables()) {
            updatable.update(deltaTime);
        }

        if (!player) return;

        if (player.currCell.type === CellType.ground && !Game.gotAllCoins && doors.some((d) => d.isOpen)) {
            for (const door of doors) door.toggleOpen();
        }

        // win condition
        if (Game.coins === 0) {
            // open doors
            if (!Game.gotAllCoins) {
                Game.gotAllCoins = true;
                for (const door of doors) door.toggleOpen();
            }

            // check distance between player and doors
            if (Game.gotAllCoins) {
                let minDoorDist = Infinity;
                for (const door of doors)
                    minDoorDist = Math.min(
                        minDoorDist,
                        getDistance(door.cellCenter.x, door.cellCenter.y, player.x, player.y)
                    );

                // if player is at a door, end level
                if (minDoorDist < PLAYER_RADIUS) {
                    console.log("WIN!");
                    this.stop();
                }
            }
        }

        if (player.currCell.item) {
            const item = player.handleCollectItem();
            if (item === GameItem.coin) Game.coins--;
            if (Game.coins === 0) console.log("coins ::", Game.coins);
        }

        for (const enemy of enemies) {
            const dist = getDistance(enemy.x, enemy.y, player.x, player.y);
            if (dist < PLAYER_RADIUS + ENEMY_RADIUS) {
                console.log("DEATH!");
                this.stop();
            }
        }

        if (this.isPlaying) {
            this.timestamp = Date.now();
            this.frameId = requestAnimationFrame(this.tick.bind(this));
        }
    }
}

class Game {
    static coins = 0;
    static gotAllCoins = false;
    static gameObjects: GameObjects = {
        doors: [],
        enemies: [],
        player: null,
    };
    private static updatables: Updatable[] = [];
    static loop: Loop;

    static getUpdatables() {
        return Game.updatables;
    }

    static addUpdatable(updatable: Updatable) {
        if (updatable instanceof Door) {
            Game.gameObjects.doors.push(updatable as Door);
        }
        if (updatable instanceof Player) {
            Game.gameObjects.player = updatable as Player;
        }
        if (updatable instanceof Enemy) {
            Game.gameObjects.enemies.push(updatable as Enemy);
        }
        Game.updatables.push(updatable);
    }

    static start() {
        Game.buildMaze();

        const player = new Player();
        Game.addUpdatable(player);

        Game.loop = new Loop();
        Game.loop.start();
    }

    private static buildMaze() {
        for (let row = 0; row < mazeBlueprint.length; row++) {
            mazeCells[row] = [];
            for (let col = 0; col < mazeBlueprint[row].length; col++) {
                const typeNum = mazeBlueprint[row][col];
                const type = cellTypesArr[typeNum];

                let cell: Cell;
                if (type === CellType.door) {
                    const door = new Door(row, col);
                    Game.addUpdatable(door);
                    cell = door;
                } else {
                    cell = new Cell(row, col, type);
                }

                if (type === CellType.ground) {
                    Game.coins++;
                }

                mazeCells[row].push(cell);
                canvas.append(cell.rect);
                if (cell.itemElem) canvas.append(cell.itemElem);
            }
        }

        for (const line of mazeCells) {
            for (const cell of line) {
                if (cell.type === CellType.enemy) {
                    const enemy = new Enemy(cell.row, cell.col);
                    Game.addUpdatable(enemy);
                }
            }
        }
        console.log(mazeCells);
    }
}

Game.start();
// const game = new Game();
// game.start();

export type GameObjects = {
    doors: Door[];
    enemies: Enemy[];
    player: Player | null;
};
