import { randRange } from "./lib/helperFns.ts";
import { mazes } from "./lib/mazes.ts";
import { Direction } from "./lib/types.ts";

const maze: Cell[][] = [];

class Cell {
    row;
    col;
    value = 0;
    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    static get4Neighbors(cell: Cell) {
        return {
            top: maze?.[cell.row - 1]?.[cell.col] || null,
            right: maze?.[cell.row]?.[cell.col + 1] || null,
            bottom: maze?.[cell.row + 1]?.[cell.col] || null,
            left: maze?.[cell.row]?.[cell.col - 1] || null,
        };
    }

    static get8Neighbors(cell: Cell) {
        return {
            top: maze?.[cell.row - 1]?.[cell.col] || null,
            right: maze?.[cell.row]?.[cell.col + 1] || null,
            bottom: maze?.[cell.row + 1]?.[cell.col] || null,
            left: maze?.[cell.row]?.[cell.col - 1] || null,

            tl: maze?.[cell.row - 1]?.[cell.col - 1] || null,
            tr: maze?.[cell.row - 1]?.[cell.col + 1] || null,
            bl: maze?.[cell.row + 1]?.[cell.col - 1] || null,
            br: maze?.[cell.row + 1]?.[cell.col + 1] || null,
        };
    }

    static canBuildPath(cell: Cell) {
        // must be a wall cell
        if (!cell || cell.value !== 0) return false;

        const { tl, top, tr, right, br, bottom, bl, left } = Cell.get8Neighbors(cell);

        // no adjacent cell trio is exclusively made of path cells
        if (left && tl && top && [left, tl, top].every((c) => c.value === 1)) return false;
        if (top && tr && right && [top, tr, right].every((c) => c.value === 1)) return false;
        if (right && br && bottom && [right, br, bottom].every((c) => c.value === 1)) return false;
        if (bottom && bl && left && [bottom, bl, left].every((c) => c.value === 1)) return false;

        return true;
    }
}

function createRandomMaze(rows: number, cols: number, doors: Direction[]) {
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

    // algorithm for creating paths
    const stack = [initialCell];

    while (stack.length > 0) {
        const cell = stack.at(-1);
        if (!cell) break;

        const neighbors = Cell.get4Neighbors(cell);
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
    // algorithm end

    // surround maze with walls
    maze.forEach((line) =>
        line.forEach((cell) => {
            // push all cells to the bottom-right, to make room for surrounding walls
            cell.row++;
            cell.col++;
        })
    );
    // top wall
    maze.unshift(
        Array(cols)
            .fill(0)
            .map((_, i) => new Cell(0, i))
    );
    // bottom wall
    maze.push(
        Array(cols)
            .fill(0)
            .map((_, i) => new Cell(maze.length, i))
    );

    for (let row = 0; row < maze.length; row++) {
        maze[row].unshift(new Cell(0, row)); // left wall
        maze[row].push(new Cell(maze[0].length - 1, row)); // right wall
    }
    // surround logic end

    // const wallsEligibleForDoors = getDoorCandidates();

    // while (doors > 0) {
    //     const randIdx = randRange(0, wallsEligibleForDoors.length - 1);
    //     const cellToBecomeDoor = wallsEligibleForDoors[randIdx];

    //     console.log({ wallsEligibleForDoors, cellToBecomeDoor });

    //     // make it a door
    //     cellToBecomeDoor.value = 4;
    //     wallsEligibleForDoors.splice(randIdx, 1);
    //     doors--;
    // }

    console.log(maze.map((line) => line.map((cell) => cell.value)));
}

// function getDoorCandidates() {
//     const doorCandidates: Cell[] = [];

//     maze.forEach((line) =>
//         line.forEach((cell) => {
//             if (cell.row === 0 || cell.col === 0 || cell.row === maze.length - 1 || cell.col === maze[0].length - 1) {
//                 doorCandidates.push(cell);
//             }
//         })
//     );

//     // remove candidates with no path neighbors
//     return doorCandidates.filter((cell) => {
//         const { top, right, bottom, left } = Cell.get4Neighbors(cell);
//         const isValid = [top, right, bottom, left].some((c) => c !== null && c.value === 1);
//         console.log({ cell }, { top, right, bottom, left }, { isValid });

//         return isValid;
//     });
// }

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
const ul = document.querySelector("ul#maze-list") as HTMLUListElement;

function drawMazeButtons() {
    Object.values(mazes).forEach((maze, i) => {
        const btn = document.createElement("button");
        btn.textContent = String(i);

        btn.addEventListener("click", () => {
            location.assign(`game?maze=${i}`);
        });
        const li = document.createElement("li");
        li.append(btn);
        ul.appendChild(li);
    });
}

drawMazeButtons();

createRandomMaze(3, 3, [Direction.top, Direction.left, Direction.bottom, Direction.right]);
