import { idMaker, randRange } from "../lib/helperFns";
import { Direction, MazeStatus, type Maze } from "../lib/types";

export function createRandomMaze(rows: number, cols: number, doors: Direction[]) {
    const maze: Cell[][] = [];

    class Cell {
        row;
        col;
        value = 0;
        constructor(row: number, col: number) {
            this.row = row;
            this.col = col;
        }

        static getNeighbors(cell: Cell) {
            return {
                top: maze?.[cell.row - 1]?.[cell.col] || null,
                right: maze?.[cell.row]?.[cell.col + 1] || null,
                bottom: maze?.[cell.row + 1]?.[cell.col] || null,
                left: maze?.[cell.row]?.[cell.col - 1] || null,
            };
        }

        static getDiagonalNeighbors(cell: Cell) {
            return {
                tl: maze?.[cell.row - 1]?.[cell.col - 1] || null,
                tr: maze?.[cell.row - 1]?.[cell.col + 1] || null,
                bl: maze?.[cell.row + 1]?.[cell.col - 1] || null,
                br: maze?.[cell.row + 1]?.[cell.col + 1] || null,
            };
        }

        static canBuildPath(cell: Cell) {
            // must be a wall cell
            if (!cell || cell.value !== 0) return false;

            const { top, right, bottom, left } = Cell.getNeighbors(cell);
            const { tl, tr, br, bl } = Cell.getDiagonalNeighbors(cell);

            // no adjacent cell trio is exclusively made of path cells
            if (left && tl && top && [left, tl, top].every((c) => c.value === 1)) return false;
            if (top && tr && right && [top, tr, right].every((c) => c.value === 1)) return false;
            if (right && br && bottom && [right, br, bottom].every((c) => c.value === 1)) return false;
            if (bottom && bl && left && [bottom, bl, left].every((c) => c.value === 1)) return false;

            return true;
        }
    }

    // make initial maze (only walls)
    for (let row = 0; row < rows; row++) {
        maze[row] = [];
        for (let col = 0; col < cols; col++) {
            maze[row][col] = new Cell(row, col);
        }
    }

    // choose initial cell
    const randRow = randRange(0, rows - 1);
    const randCol = randRange(0, cols - 1);
    const initialCell = maze[randRow][randCol];

    // ************** algorithm for creating paths
    const stack = [initialCell];
    while (stack.length > 0) {
        const cell = stack.at(-1);
        if (!cell) break;

        const neighbors = Cell.getNeighbors(cell);
        const neighborCandidates = Object.values(neighbors).filter(Cell.canBuildPath);

        if (neighborCandidates.length === 0) {
            stack.pop();
            continue;
        }

        const randIdx = randRange(0, neighborCandidates.length - 1);
        const chosenCell = neighborCandidates[randIdx];
        // change cell type from wall to ground
        chosenCell.value = 1;

        stack.push(chosenCell);
    }
    // ************** algorithm END

    // ************** surround maze with walls
    maze.forEach((line) =>
        line.forEach((cell) => {
            // push all cells to the bottom-right, to make room for surrounding walls
            cell.row++;
            cell.col++;
        })
    );
    // top wall
    maze.unshift(
        Array(cols + 2)
            .fill(0)
            .map((_, i) => new Cell(0, i))
    );
    // bottom wall
    maze.push(
        Array(cols + 2)
            .fill(0)
            .map((_, i) => new Cell(maze.length, i))
    );

    for (let row = 1; row < maze.length - 1; row++) {
        maze[row].unshift(new Cell(row, 0)); // left wall
        maze[row].push(new Cell(row, maze[0].length - 1)); // right wall
    }
    // ************** surround maze with walls END

    // ************** doors logic
    for (const door of doors) {
        let candidates: Cell[] = [];
        if (door === Direction.top) {
            candidates = maze[0].slice();
            candidates.shift();
            candidates.pop();
        }
        if (door === Direction.right) {
            maze.forEach((line, i) => {
                if (i > 0 && i < maze.length - 1) candidates.push(line.at(-1)!);
            });
        }
        if (door === Direction.bottom) {
            candidates = maze.at(-1)!.slice();
            candidates.shift();
            candidates.pop();
        }
        if (door === Direction.left) {
            maze.forEach((line, i) => {
                if (i > 0 && i < maze.length - 1) candidates.push(line[0]);
            });
        }

        const filteredCandidates = candidates.filter((c) =>
            Object.values(Cell.getNeighbors(c)).some((n) => n && n.value === 1)
        );
        if (filteredCandidates.length == 0) {
            console.warn("could not find a place to stick this door", door);
            continue;
        }
        const randIdx = randRange(0, filteredCandidates.length - 1);
        const cellToBecomeDoorRef = filteredCandidates[randIdx];

        // console.log({ cellToBecomeDoorRef });
        const actualCell = maze[cellToBecomeDoorRef.row][cellToBecomeDoorRef.col];
        actualCell.value = 4;
    }
    // ************** doors logic END

    // ************** create and distribute enemies
    // 1. determine enemy count based on the amount of cells in the maze (large maze == more enemies)
    let groundCellCount = 0;
    maze.forEach((line) =>
        line.forEach((cell) => {
            if (cell.value === 1) groundCellCount++;
        })
    );
    let enemyCount = 1;
    if (groundCellCount >= 72) enemyCount = 5;
    else if (groundCellCount >= 60) enemyCount = 4;
    else if (groundCellCount >= 48) enemyCount = 3;
    else if (groundCellCount >= 32) enemyCount = 2;

    // 2. find center cell, then spiral outwards adding enemies as ground cells are found
    // keep spawning enemies until all enemies are laid out.
    const dirs = [Direction.top, Direction.left, Direction.bottom, Direction.right];
    let steps = 0;
    let dirIdx = 0;
    let enemyRow = Math.ceil(rows / 2);
    let enemyCol = Math.ceil(cols / 2);
    while (enemyCount > 0) {
        const isEven = dirIdx % 2 == 0;
        if (isEven) steps++;

        let repeatCount = 0;
        while (repeatCount < steps) {
            const dir = dirs[dirIdx % 4];
            if (dir == Direction.top) enemyRow--;
            if (dir == Direction.bottom) enemyRow++;
            if (dir == Direction.left) enemyCol--;
            if (dir == Direction.right) enemyCol++;

            const cell = maze[enemyRow][enemyCol];
            if (cell.value === 1) {
                // found ground spot to place enemy
                enemyCount--;
                cell.value = 2;
            }

            console.log({ dir, cell });
            repeatCount++;
        }
        dirIdx++;
    }

    // ************** create and distribute enemies END

    // console.log(JSON.stringify(maze.map((line) => line.map((cell) => cell.value))));
    // console.log(maze.map((line) => line.map((cell) => cell.value)));
    // console.log(maze);
    // return maze;
    return maze.map((line) => line.map((cell) => cell.value));
}

function getRandomDoors() {
    const doors: Direction[] = [];
    while (doors.length == 0) {
        Object.values(Direction).forEach((dir) => {
            const coinFlip = randRange(0, 1);
            if (coinFlip == 1) doors.push(dir);
        });
    }
    return doors;
}

// export function generateMazes(mazeCount = 10) {
//     const mazes: Record<string, Maze> = {};
//     const rowsMinMax = [2, 20];
//     const colsMinMax = [2, 20];

//     let counter = 0;
//     while (counter < mazeCount) {
//         const rows = randRange(rowsMinMax[0], rowsMinMax[1]);
//         const cols = randRange(colsMinMax[0], colsMinMax[1]);

//         const doors = getRandomDoors();

//         const id = idMaker();
//         mazes[id] = {
//             id,
//             index: counter,
//             cells: createRandomMaze(rows, cols, doors),
//             status: MazeStatus.discovered,
//         };
//         counter++;

//         // console.log({
//         //     counter,
//         //     generatedMaze,
//         //     doors,
//         //     maze: JSON.stringify(
//         //         generatedMaze.map((line) => line.map((cell) => cell.value)),
//         //         null
//         //     ),
//         // });
//     }

//     return mazes;
// }
