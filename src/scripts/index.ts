import { createRandomMaze } from "./createRandomMaze.ts";
import { randRange } from "../lib/helperFns.ts";
import { Direction } from "../lib/types.ts";

const genBtn = document.querySelector("#mazes-rand-gen") as HTMLButtonElement;

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

const mazeCount = 10;
function generateMazes() {
    const rowsMinMax = [2, 20];
    const colsMinMax = [2, 20];

    let counter = 0;
    while (counter < mazeCount) {
        counter++;

        const rows = randRange(rowsMinMax[0], rowsMinMax[1]);
        const cols = randRange(colsMinMax[0], colsMinMax[1]);

        const doors = getRandomDoors();

        const generatedMaze = createRandomMaze(rows, cols, doors);

        console.log({
            counter,
            generatedMaze,
            doors,
            maze: JSON.stringify(
                generatedMaze.map((line) => line.map((cell) => cell.value)),
                null
            ),
        });
    }
}

genBtn.addEventListener("click", generateMazes);

// const ul = document.querySelector("ul#maze-list") as HTMLUListElement;
// function drawMazeButtons() {
//     Object.values(mazes).forEach((maze, i) => {
//         const btn = document.createElement("button");
//         btn.textContent = String(i);

//         btn.addEventListener("click", () => {
//             location.assign(`game?maze=${i}`);
//         });
//         const li = document.createElement("li");
//         li.append(btn);
//         ul.appendChild(li);
//     });
// }

// drawMazeButtons();

// createRandomMaze()
