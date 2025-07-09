import { mazes } from "./lib/mazes.ts";

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
