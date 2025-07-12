import { svgNamespace, MAP_CELL_SIZE } from "../lib/constants";
import { sleep } from "../lib/helperFns";
import { Direction } from "../lib/types";

const canvas = document.querySelector<SVGSVGElement>("#canvas")!;

export class MapTile {
    row;
    col;
    svg = document.createElementNS(svgNamespace, "g");
    visited = false;
    focused = false;
    walls = { top: true, right: true, bottom: true, left: true };
    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;

        this.svg.dataset["row"] = String(this.row);
        this.svg.dataset["col"] = String(this.col);
        this.svg.dataset["walls"] = Object.entries(this.walls)
            .map(([dir, hasWall]) => (hasWall ? dir[0] : ""))
            .join("");

        const x = this.col * MAP_CELL_SIZE;
        const y = this.row * MAP_CELL_SIZE;

        const rect = document.createElementNS(svgNamespace, "rect");

        rect.setAttribute("width", MAP_CELL_SIZE + "px");
        rect.setAttribute("height", MAP_CELL_SIZE + "px");
        rect.setAttribute("x", x + "px");
        rect.setAttribute("y", y + "px");

        this.svg.append(rect);
        this.redraw();

        canvas.append(this.svg);
    }

    redraw() {
        const x = this.col * MAP_CELL_SIZE;
        const y = this.row * MAP_CELL_SIZE;

        const lines = Array.from(this.svg.querySelectorAll("line"));
        lines.forEach((l) => l.remove());
        // const lines = this.svg.querySelectorAll("line");

        if (this.walls.top) {
            const topLine = document.createElementNS(svgNamespace, "line");
            topLine.setAttribute("x1", x + "px");
            topLine.setAttribute("y1", y + "px");
            topLine.setAttribute("x2", x + MAP_CELL_SIZE + "px");
            topLine.setAttribute("y2", y + "px");
            topLine.setAttribute("stroke", "orange");
            topLine.dataset["linePos"] = Direction.top;
            this.svg.append(topLine);
        }
        if (this.walls.right) {
            const rightLine = document.createElementNS(svgNamespace, "line");
            rightLine.setAttribute("x1", x + MAP_CELL_SIZE + "px");
            rightLine.setAttribute("y1", y + "px");
            rightLine.setAttribute("x2", x + MAP_CELL_SIZE + "px");
            rightLine.setAttribute("y2", y + MAP_CELL_SIZE + "px");
            rightLine.setAttribute("stroke", "orange");
            rightLine.dataset["linePos"] = Direction.right;
            this.svg.append(rightLine);
        }

        if (this.walls.bottom) {
            const bottomLine = document.createElementNS(svgNamespace, "line");
            bottomLine.setAttribute("x1", x + "px");
            bottomLine.setAttribute("y1", y + MAP_CELL_SIZE + "px");
            bottomLine.setAttribute("x2", x + MAP_CELL_SIZE + "px");
            bottomLine.setAttribute("y2", y + MAP_CELL_SIZE + "px");
            bottomLine.setAttribute("stroke", "orange");
            bottomLine.dataset["linePos"] = Direction.bottom;
            this.svg.append(bottomLine);
        }

        if (this.walls.left) {
            const leftLine = document.createElementNS(svgNamespace, "line");
            leftLine.setAttribute("x1", x + "px");
            leftLine.setAttribute("y1", y + "px");
            leftLine.setAttribute("x2", x + "px");
            leftLine.setAttribute("y2", y + MAP_CELL_SIZE + "px");
            leftLine.setAttribute("stroke", "orange");
            leftLine.dataset["linePos"] = Direction.left;
            this.svg.append(leftLine);
        }

        if (this.visited) {
            // this.svg.classList.add("bg-blue-600");
            // this.svg.classList.remove("bg-slate-400");
            this.svg.setAttribute("fill", "gray");
        } else {
            // this.svg.classList.remove("bg-blue-600");
            // this.svg.classList.add("bg-slate-400");
            this.svg.setAttribute("fill", "black");
        }

        this.svg.dataset["walls"] = Object.entries(this.walls)
            .map(([dir, hasWall]) => (hasWall ? dir[0] : ""))
            .join("");
    }
}

export class MapGenerator {
    width;
    height;
    grid: MapTile[][] = [];
    stack: MapTile[] = [];

    constructor(width: number, height: number) {
        if (width <= 0 || height <= 0) {
            throw new Error("Maze dimensions must be positive.");
        }
        this.width = width;
        this.height = height;
        this.grid = this.initializeGrid();
    }

    /**
     * Initializes the grid with all cells having all walls intact and marked as unvisited.
     */
    initializeGrid() {
        const grid: MapTile[][] = ([] = []);
        for (let r = 0; r < this.height; r++) {
            grid[r] = [];
            for (let c = 0; c < this.width; c++) {
                grid[r][c] = new MapTile(r, c);
            }
        }
        return grid;
    }

    /**
     * Generates the maze using the backtracking algorithm.
     * @returns The generated grid representing the maze.
     */
    async generate() {
        // Start at a random cell
        const startRow = Math.floor(Math.random() * this.height);
        const startCol = Math.floor(Math.random() * this.width);
        let currentCell = this.grid[startRow][startCol];
        currentCell.visited = true;
        currentCell.focused = true;
        this.stack.push(currentCell);

        while (this.stack.length > 0) {
            await sleep(0);
            this.grid.forEach((row) => {
                row.forEach((item) => {
                    item.redraw();
                });
            });
            currentCell.focused = false;
            const unvisitedNeighbors = this.getUnvisitedNeighbors(currentCell);

            if (unvisitedNeighbors.length > 0) {
                // Pick a random unvisited neighbor
                const nextCell = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];

                // Remove walls between current and next cell
                this.removeWalls(currentCell, nextCell);

                nextCell.visited = true;
                this.stack.push(nextCell);
                currentCell = nextCell;
            } else {
                // Backtrack
                currentCell = this.stack.pop()!; // Pop guarantees there's an element
            }
        }
        return this.grid;
    }

    /**
     * Gets a list of unvisited neighbor cells for a given cell.
     * @param cell The cell to check neighbors for.
     * @returns An array of unvisited neighbor cells.
     */
    getUnvisitedNeighbors(cell: MapTile) {
        const neighbors = [];
        const { row, col } = cell;

        // Top neighbor
        if (row > 0 && !this.grid[row - 1][col].visited) {
            neighbors.push(this.grid[row - 1][col]);
        }
        // Right neighbor
        if (col < this.width - 1 && !this.grid[row][col + 1].visited) {
            neighbors.push(this.grid[row][col + 1]);
        }
        // Bottom neighbor
        if (row < this.height - 1 && !this.grid[row + 1][col].visited) {
            neighbors.push(this.grid[row + 1][col]);
        }
        // Left neighbor
        if (col > 0 && !this.grid[row][col - 1].visited) {
            neighbors.push(this.grid[row][col - 1]);
        }

        return neighbors;
    }

    /**
     * Removes the walls between two adjacent cells.
     * @param cell1 The first cell.
     * @param cell2 The second cell.
     */
    removeWalls(cell1: MapTile, cell2: MapTile) {
        const rowDiff = cell1.row - cell2.row;
        const colDiff = cell1.col - cell2.col;

        if (rowDiff === 1) {
            // cell2 is above cell1
            cell1.walls.top = false;
            cell2.walls.bottom = false;
        } else if (rowDiff === -1) {
            // cell2 is below cell1
            cell1.walls.bottom = false;
            cell2.walls.top = false;
        } else if (colDiff === 1) {
            // cell2 is to the left of cell1
            cell1.walls.left = false;
            cell2.walls.right = false;
        } else if (colDiff === -1) {
            // cell2 is to the right of cell1
            cell1.walls.right = false;
            cell2.walls.left = false;
        }
    }

    /**
     * A utility function to print the maze to the console.
     * @param grid The maze grid to print.
     */
    static printMaze(grid: MapTile[][]) {
        const height = grid.length;
        const width = grid[0].length;

        // Print top border
        console.log(" " + "_".repeat(width * 2 - 1));

        for (let r = 0; r < height; r++) {
            let rowString = "|";
            let floorString = "|";
            for (let c = 0; c < width; c++) {
                const cell = grid[r][c];
                // Cell content and right wall
                rowString += " " + (cell.walls.right ? "|" : " ");
                // Bottom wall
                floorString += cell.walls.bottom ? "__" : "  ";
            }
            console.log(rowString);
            if (r < height - 1) {
                // Don't print bottom border for the last row's "floor"
                console.log(floorString);
            }
        }
        // Print bottom-most right corner wall if the last cell has a right wall
        let lastRowString = "|";
        for (let c = 0; c < width; c++) {
            lastRowString += grid[height - 1][c].walls.bottom ? "__" : "  ";
        }
        console.log(lastRowString);
    }
}
