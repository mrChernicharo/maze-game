import { MAP_CELL_SIZE, MINI_MAZE_CELL_SIZE, svgNamespace } from "../lib/constants";
import { parseURLQueryParams, randRange, sleep } from "../lib/helperFns";
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
            // console.log(this);
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

        // console.log("grid exits :::", MapGenerator.getGridExits(this.grid));
        // console.log("grid walls :::", MapGenerator.getSerializedGridWalls(this.grid));
        // console.log("grid:::", this.grid);

        // localStorage.setItem(
        //     "test-grid",
        //     JSON.stringify([
        //         ["tl", "trb", "tl", "trb"],
        //         ["rl", "tbl", "b", "tr"],
        //         ["rl", "tl", "tb", "r"],
        //         ["rl", "bl", "tr", "rl"],
        //         ["bl", "tb", "rb", "rbl"],
        //     ])
        // );

        // console.log({ mazes, mazesAsArray });

        const storedMapsData = JSON.parse(localStorage.getItem("maps")!) as any;
        if (!storedMapsData) {
            const mapGenerator = new MapGenerator(worldRows, worldCols);
            this.grid = await mapGenerator.generate();
            // console.log("grid walls :::", MapGenerator.getSerializedGridWalls(this.grid));

            // const mazeCount = worldRows * worldCols;
            // this.mazes = generateMazes(mazeCount);
            const initialMapsData = {
                [worldId]: {
                    gridWalls: MapGenerator.getSerializedGridWalls(this.grid),
                    mazes: [],
                    corridors: [],
                },
            };
            localStorage.setItem("maps", JSON.stringify(initialMapsData));
        } else {
            const mapData = storedMapsData[worldId];
            const gridWalls = mapData.gridWalls;
            this.grid = MapGenerator.buildFromSerializedWallData(gridWalls);
            // this.mazes = mapData.mazes;
            // this.map = mapData.map.map((tile: any) => new MapTile(tile.row, tile.col));
        }

        // const mazesAsArray = Object.values(this.mazes).sort((a, b) => a.index - b.index);

        // let tileIdx = 0;
        // this.map.forEach((line) => {
        //     line.forEach((tile) => {
        //         const maze = mazesAsArray[tileIdx];

        //         const miniMazeRect = document.createElementNS(svgNamespace, "rect");

        //         const width = maze.cells[0].length * MINI_MAZE_CELL_SIZE;
        //         const height = maze.cells.length * MINI_MAZE_CELL_SIZE;

        //         console.log({ tileIdx, tile, maze, width, height });

        //         const topX = tile.col * MAP_CELL_SIZE;
        //         const topY = tile.row * MAP_CELL_SIZE;
        //         const centerX = topX + (MAP_CELL_SIZE - width) / 2;
        //         const centerY = topY + (MAP_CELL_SIZE - height) / 2;

        //         miniMazeRect.setAttribute("x", centerX + "px");
        //         miniMazeRect.setAttribute("y", centerY + "px");
        //         miniMazeRect.setAttribute("width", width + "px");
        //         miniMazeRect.setAttribute("height", height + "px");
        //         miniMazeRect.setAttribute("fill", "black");
        //         tile.svg.append(miniMazeRect);
        //         tile.svg.addEventListener("click", () => this.goToLevelScreen(maze.id));
        //         tileIdx++;
        //     });
        // });
    }

    goToLevelScreen(mazeId: string) {
        location.assign(`/src/pages/level.html?worldId=${worldId}&mazeId=${mazeId}`);
    }
}

new WorldMap();
