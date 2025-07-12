import { mazes } from "../lib/mazes.ts";
import { generateMazes } from "./createRandomMaze.ts";

const genBtn = document.querySelector("#mazes-rand-gen") as HTMLButtonElement;

genBtn.addEventListener("click", () => console.log(generateMazes()));

const ul = document.querySelector("ul#maze-list") as HTMLUListElement;
function drawMazeButtons() {
    Object.values(mazes).forEach((maze, i) => {
        const btn = document.createElement("button");
        btn.textContent = String(i);

        btn.addEventListener("click", () => {
            location.assign(`src/pages/game.html?maze=${i}`);
        });
        const li = document.createElement("li");
        li.append(btn);
        ul.appendChild(li);
    });
}

drawMazeButtons();
