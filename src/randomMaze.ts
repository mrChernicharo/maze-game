import { createRandomMaze } from "./createRandomMaze.ts";
import { CELL_SIZE, COLORS, svgNamespace } from "./lib/constants.ts";
import { Direction } from "./lib/types.ts";

const canvas = document.querySelector("#canvas") as SVGSVGElement;
const colors = [COLORS.wall, COLORS.ground, COLORS.ground, COLORS.ground, COLORS.door];

const generatedMaze = createRandomMaze(12, 3, [Direction.left, Direction.right, Direction.top]);

// DRAW to canvas
canvas.style.height = generatedMaze.length * CELL_SIZE + "px";
canvas.style.width = generatedMaze[0].length * CELL_SIZE + "px";
generatedMaze.forEach((line) =>
    line.forEach((cell) => {
        const rect = document.createElementNS(svgNamespace, "rect");
        rect.setAttribute("x", cell.col * CELL_SIZE + "px");
        rect.setAttribute("y", cell.row * CELL_SIZE + "px");
        rect.setAttribute("width", CELL_SIZE + "px");
        rect.setAttribute("height", CELL_SIZE + "px");
        rect.setAttribute("fill", colors[cell.value]);

        canvas.append(rect);
    })
);
// createRandomMaze(12, 12, [Direction.left, Direction.bottom, Direction.right]);
// createRandomMaze(12, 12, [Direction.top, Direction.left, Direction.bottom, Direction.right]);
