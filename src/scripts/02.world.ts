import { COLOR_ARR, MAP_CELL_SIZE, MINI_MAZE_CELL_SIZE, svgNamespace } from "../lib/constants";
import { idMaker, parseURLQueryParams, randRange, sleep } from "../lib/helperFns";
import { Direction, type Maze, type World } from "../lib/types";
import { createRandomMaze, generateMazes } from "./createRandomMaze";
import { MapGenerator, MapTile } from "./MapGenerator";

const { worldId } = parseURLQueryParams<{ worldId: string }>();
console.log("worldId :::", worldId);

const canvas = document.querySelector<SVGSVGElement>("#canvas")!;

class WorldMap {
    world!: World;
    mazes: Record<string, Maze> = {};
    grid: MapTile[][] = [];
    constructor() {
        this.hydrate().then(() => {
            console.log(this);
        });
    }

    private async hydrate() {
        const storedWorldsData = localStorage.getItem("worlds");
        if (!storedWorldsData) throw Error("no stored worlds data");

        const worlds = JSON.parse(storedWorldsData);
        this.world = worlds[worldId];

        const [worldRows, worldCols] = this.world.size;
        canvas.style.width = worldRows * MAP_CELL_SIZE + "px";
        canvas.style.height = worldCols * MAP_CELL_SIZE + "px";

        const storedMapsData = JSON.parse(localStorage.getItem("maps")!) as any;
        if (!storedMapsData) {
            this.grid = await new MapGenerator(worldRows, worldCols).generate();

            const rowsMinMax = [2, 14];
            const colsMinMax = [2, 14];

            let index = 0;
            this.grid.forEach((line) => {
                line.forEach((tile) => {
                    const id = idMaker();
                    const rows = randRange(rowsMinMax[0], rowsMinMax[1]);
                    const cols = randRange(colsMinMax[0], colsMinMax[1]);
                    const doors: Direction[] = [];
                    Object.entries(tile.walls).forEach(([dir, hasWall]) => {
                        if (!hasWall) doors.push(dir as Direction);
                    });

                    const newMaze: Maze = { id, index, cells: createRandomMaze(rows, cols, doors) };

                    this.mazes[id] = newMaze;
                    index++;
                });
            });

            const initialMapsData = {
                [worldId]: {
                    gridWalls: MapGenerator.getSerializedGridWalls(this.grid),
                    mazes: this.mazes,
                    corridors: [],
                },
            };
            localStorage.setItem("maps", JSON.stringify(initialMapsData));
        }
        // localstorage has data
        else {
            const mapData = storedMapsData[worldId];
            const gridWalls = mapData.gridWalls;
            this.grid = MapGenerator.buildFromSerializedWallData(gridWalls);
            this.mazes = mapData.mazes;
        }

        const mazesAsArray = Object.values(this.mazes).sort((a, b) => a.index - b.index);

        let tileIdx = 0;
        this.grid.forEach((gridLine) => {
            gridLine.forEach((tile) => {
                const maze = mazesAsArray[tileIdx];

                const miniMazeRect = document.createElementNS(svgNamespace, "rect");

                const width = maze.cells[0].length * MINI_MAZE_CELL_SIZE;
                const height = maze.cells.length * MINI_MAZE_CELL_SIZE;

                // console.log({ tileIdx, tile, maze, width, height });

                const topX = tile.col * MAP_CELL_SIZE;
                const topY = tile.row * MAP_CELL_SIZE;
                const alignedX = topX + (MAP_CELL_SIZE - width) / 2;
                const alignedY = topY + (MAP_CELL_SIZE - height) / 2;

                miniMazeRect.setAttribute("x", alignedX + "px");
                miniMazeRect.setAttribute("y", alignedY + "px");
                miniMazeRect.setAttribute("width", width + "px");
                miniMazeRect.setAttribute("height", height + "px");
                miniMazeRect.setAttribute("fill", "white");
                tile.svg.append(miniMazeRect);
                tile.svg.addEventListener("click", () => this.goToLevelScreen(maze.id));
                tileIdx++;

                for (let row = 0; row < maze.cells.length; row++) {
                    for (let col = 0; col < maze.cells[0].length; col++) {
                        const cell = maze.cells[row][col];
                        const rect = document.createElementNS(svgNamespace, "rect");

                        rect.setAttribute("x", alignedX + col * MINI_MAZE_CELL_SIZE + "px");
                        rect.setAttribute("y", alignedY + row * MINI_MAZE_CELL_SIZE + "px");
                        rect.setAttribute("width", MINI_MAZE_CELL_SIZE + "px");
                        rect.setAttribute("height", MINI_MAZE_CELL_SIZE + "px");
                        rect.setAttribute("stroke", cell ? "black" : "none"); // 0 -> wall
                        rect.setAttribute("fill", COLOR_ARR[cell]);
                        tile.svg.append(rect);
                    }
                }
            });
        });
    }

    goToLevelScreen(mazeId: string) {
        location.assign(`/src/pages/03.level.html?worldId=${worldId}&mazeId=${mazeId}`);
    }
}

new WorldMap();
