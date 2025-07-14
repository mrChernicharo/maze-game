console.log("hello gameMap");
import { createRandomMaze } from "./createRandomMaze";
import { CELL_SIZE, MAP_CELL_SIZE, MINI_MAZE_CELL_SIZE, svgNamespace } from "../lib/constants";
import { randRange, sleep } from "../lib/helperFns";
import { Direction } from "../lib/types";
import { MapGenerator } from "./MapGenerator";

const canvas = document.querySelector<SVGSVGElement>("#canvas")!;

const dims = [5, 5];
canvas.style.width = dims[0] * MAP_CELL_SIZE + "px";
canvas.style.height = dims[1] * MAP_CELL_SIZE + "px";
const mapGenerator = new MapGenerator(dims[0], dims[1]);
const map = await mapGenerator.generate();
// console.log(maze);

const rowsMinMax = [3, 12];
const colsMinMax = [3, 12];

map.forEach((line) => {
    line.forEach((tile) => {
        const rows = randRange(rowsMinMax[0], rowsMinMax[1]);
        const cols = randRange(colsMinMax[0], colsMinMax[1]);
        const doors = Object.entries(tile.walls)
            .filter(([dir, enabled]) => enabled)
            .map(([dir, enabled]) => dir as Direction);

        const maze = createRandomMaze(rows, cols, doors);
        console.log({ rows, cols, doors, maze, cell: tile });

        const miniMazeRect = document.createElementNS(svgNamespace, "rect");

        const width = cols * MINI_MAZE_CELL_SIZE;
        const height = rows * MINI_MAZE_CELL_SIZE;

        const topX = tile.col * MAP_CELL_SIZE;
        const topY = tile.row * MAP_CELL_SIZE;
        const centerX = topX + (MAP_CELL_SIZE - width) / 2;
        const centerY = topY + (MAP_CELL_SIZE - height) / 2;

        miniMazeRect.setAttribute("x", centerX + "px");
        miniMazeRect.setAttribute("y", centerY + "px");
        miniMazeRect.setAttribute("width", width + "px");
        miniMazeRect.setAttribute("height", height + "px");
        miniMazeRect.setAttribute("fill", "black");
        tile.svg.append(miniMazeRect);
    });
});
