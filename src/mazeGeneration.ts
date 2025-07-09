// import "./style.css";
// import typescriptLogo from "./typescript.svg";
// import viteLogo from "/vite.svg";
import { svgNamespace, MAZE_CELL_SIZE, COLORS, cellTypesArr } from "./lib/constants";
import { CellType } from "./lib/types";

const rowsInput = document.querySelector<HTMLInputElement>("input#rows")!;
const colsInput = document.querySelector<HTMLInputElement>("input#cols")!;
const canvas = document.querySelector<SVGSVGElement>("#canvas")!;
const printBtn = document.querySelector<HTMLButtonElement>("#print-btn")!;
const radioButtons = Array.from(document.getElementsByName("tile-radio")) as Array<HTMLInputElement>;
const outputDisplay = document.querySelector<HTMLOutputElement>("#output")!;
const outputResult = document.querySelector<HTMLDivElement>("#output-result")!;

class MazeCell {
  row: number;
  col: number;
  rect: SVGRectElement;
  type: CellType;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
    this.type = CellType.wall;

    this.rect = document.createElementNS(svgNamespace, "rect");
    this.rect.dataset["col"] = String(this.col);
    this.rect.dataset["row"] = String(this.row);

    this.rect.setAttribute("x", this.col * MAZE_CELL_SIZE + "px");
    this.rect.setAttribute("y", this.row * MAZE_CELL_SIZE + "px");
    this.rect.setAttribute("width", MAZE_CELL_SIZE + "px");
    this.rect.setAttribute("height", MAZE_CELL_SIZE + "px");
    this.rect.setAttribute("stroke", "black");
    this.rect.setAttribute("fill", COLORS[this.type]);

    this.rect.addEventListener("click", () => {
      console.log("clicked cell", this);
    });
  }

  setType(type: CellType) {
    this.type = type;
    this.rect.setAttribute("fill", COLORS[this.type]);
  }
}

class Maze {
  private rows: number;
  private cols: number;
  private cells: MazeCell[][] = [];
  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.build();
  }

  setRows(rows: number) {
    this.rows = rows;
    this.build();
  }

  setCols(cols: number) {
    this.cols = cols;
    this.build();
  }

  getCell(row: number, col: number) {
    return this.cells[row][col];
  }

  build() {
    canvas.innerHTML = "";
    if (this.cells.length > this.rows) {
      let exceedingRows = this.cells.length - this.rows;
      console.log({ exceedingRows });
      while (exceedingRows > 0) {
        this.cells.pop();
        exceedingRows--;
      }
    }

    for (let row = 0; row < this.rows; row++) {
      if (!this.cells[row]) this.cells[row] = [];

      if (this.cells[row].length > this.cols) {
        let exceedingCols = this.cells[row].length - this.cols;
        while (exceedingCols > 0) {
          this.cells[row].pop();
          exceedingCols--;
        }
      }

      for (let col = 0; col < this.cols; col++) {
        const existingCell = this.getCell(row, col);
        if (existingCell) {
          canvas.append(existingCell.rect);
        } else {
          const cell = new MazeCell(row, col);
          this.cells[row].push(cell);
          canvas.append(cell.rect);
        }
      }
    }

    console.log("build!", this);
  }

  print() {
    const result: number[][] = [];
    for (let row = 0; row < this.rows; row++) {
      result[row] = [];
      for (let col = 0; col < this.cols; col++) {
        result[row][col] = cellTypesArr.indexOf(this.cells[row][col].type);
      }
    }

    outputDisplay.textContent = JSON.stringify(result);
    console.log(JSON.stringify(result));
  }
}

class MazeGenerator {
  maze: Maze;
  selectedCellType = CellType.ground;

  constructor() {
    this.maze = new Maze(10, 10);
    this.addListeners();
  }

  addListeners() {
    radioButtons.forEach((radio) => {
      radio.addEventListener("click", (e) => {
        const ele = e.target as HTMLInputElement;
        const cellType = ele.id as CellType;
        this.selectedCellType = cellType;
      });
    });

    canvas.addEventListener("click", (e) => {
      e.preventDefault();

      // console.log("ok", selectedCellType);
      const ele = e.target as SVGRectElement;
      if (ele && ele.dataset["row"] && ele.dataset["col"]) {
        console.log(ele.dataset["row"], ele.dataset["col"]);
        const row = Number(ele.dataset["row"]);
        const col = Number(ele.dataset["col"]);
        const cell = this.maze.getCell(row, col);
        cell.setType(this.selectedCellType);
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if ([1, 2].includes(e.buttons)) {
        const ele = e.target as SVGRectElement;

        if (ele && ele.dataset["row"] && ele.dataset["col"]) {
          // console.log(ele.dataset["row"], ele.dataset["col"]);
          const row = Number(ele.dataset["row"]);
          const col = Number(ele.dataset["col"]);

          const cell = this.maze.getCell(row, col);

          if (e.buttons === 1) cell.setType(this.selectedCellType);
          else if (e.buttons === 2) cell.setType(CellType.wall); // right-click
        }
      }
    });

    rowsInput.addEventListener("input", (e) => {
      const ele = e.target as HTMLInputElement;
      this.maze.setRows(ele.valueAsNumber);
    });

    colsInput.addEventListener("input", (e) => {
      const ele = e.target as HTMLInputElement;
      this.maze.setCols(ele.valueAsNumber);
    });

    printBtn.addEventListener("click", () => {
      this.maze.print();
    });

    outputDisplay.addEventListener("click", async (e) => {
      try {
        await navigator.clipboard.writeText(outputDisplay.textContent || "");
        outputResult.textContent = "Text copied to clipboard successfully!";
      } catch (err) {
        outputResult.textContent = "Failed to copy text";
        console.error("Failed to copy text: ", err);
      }

      setTimeout(() => (outputResult.textContent = ""), 2000);
    });
  }
}

new MazeGenerator();
