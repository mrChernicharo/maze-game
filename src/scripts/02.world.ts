import { COLOR_ARR, colsMinMax, MAP_CELL_SIZE, MINI_MAZE_CELL_SIZE, rowsMinMax, svgNamespace } from "../lib/constants";
import { idMaker, parseURLQueryParams, randRange, sleep } from "../lib/helperFns";
import { CorridorStatus, Direction, MazeStatus, type Maze, type Walls, type World } from "../lib/types";
import { createRandomMaze } from "./createRandomMaze";
import { MapGenerator, MapTile } from "./MapGenerator";

const { worldId } = parseURLQueryParams<{ worldId: string }>();
console.log("worldId :::", worldId);

const canvas = document.querySelector<SVGSVGElement>("#canvas")!;

class WorldMap {
    world!: World;
    mazes: Record<string, Maze> = {};
    grid: MapTile[][] = [];
    constructor() {
        this.init().then(() => {
            console.log(this);
        });
    }

    private async init() {
        await this.hydrate();
        this.draw();
    }

    private async hydrate() {
        const storedWorldsData = localStorage.getItem("worlds");
        if (!storedWorldsData) throw Error("no stored worlds data");

        const worlds = JSON.parse(storedWorldsData);
        this.world = worlds[worldId];

        const storedMapsData = JSON.parse(localStorage.getItem("maps")!) as any;
        if (!storedMapsData || !storedMapsData[worldId]) {
            await this.initializeMapsData();
        } else {
            const mapData = storedMapsData[worldId];
            const gridWalls = mapData.gridWalls;
            this.grid = MapGenerator.buildFromSerializedWallData(gridWalls);
            this.mazes = mapData.mazes;
        }
    }

    private async initializeMapsData() {
        const [worldRows, worldCols] = this.world.size;
        const initialMazeIdx = randRange(0, worldRows * worldCols - 1);

        this.grid = await new MapGenerator(worldRows, worldCols).generate();

        let index = 0;
        this.grid.forEach((line) => {
            line.forEach((tile) => {
                const id = idMaker();
                const rows = randRange(rowsMinMax[0], rowsMinMax[1]);
                const cols = randRange(colsMinMax[0], colsMinMax[1]);
                const doors = this.getDoorDirectionsFromWalls(tile.walls);
                const newMaze: Maze = {
                    id,
                    index,
                    cells: createRandomMaze(rows, cols, doors),
                    status: index == initialMazeIdx ? MazeStatus.discovered : MazeStatus.undiscovered,
                };

                this.mazes[id] = newMaze;
                index++;
            });
        });
        const gridWalls = MapGenerator.getSerializedGridWalls(this.grid);
        const initialMapsData = {
            [worldId]: {
                gridWalls,
                mazes: this.mazes,
                corridors: this.createCorridors(),
            },
        };
        localStorage.setItem("maps", JSON.stringify(initialMapsData));
    }

    private getDoorDirectionsFromWalls(walls: Walls) {
        const doors: Direction[] = [];
        Object.entries(walls).forEach(([dir, hasWall]) => {
            if (!hasWall) doors.push(dir as Direction);
        });
        return doors;
    }

    getNeighborTiles(tile: MapTile) {
        return {
            top: this.grid?.[tile.row - 1]?.[tile.col] ?? null,
            right: this.grid?.[tile.row]?.[tile.col + 1] ?? null,
            bottom: this.grid?.[tile.row + 1]?.[tile.col] ?? null,
            left: this.grid?.[tile.row]?.[tile.col - 1] ?? null,
        };
    }

    private createCorridors() {
        const connections: Set<`${number}-${number}`> = new Set();
        this.grid.forEach((line) => {
            line.forEach((tile) => {
                const directions = this.getDoorDirectionsFromWalls(tile.walls);
                const neighborTiles = this.getNeighborTiles(tile);
                directions.forEach((dir) => {
                    if (neighborTiles[dir])
                        connections.add(
                            [tile.index, neighborTiles[dir].index]
                                .sort((a, b) => a - b)
                                .join("-") as `${number}-${number}`
                        );
                });
            });
        });
        return Array.from(connections).map((corridor) => ({
            id: idMaker(),
            status: CorridorStatus.undiscovered,
            tileIndices: corridor.split("-").map(Number),
        }));
    }

    private draw() {
        const [worldRows, worldCols] = this.world.size;
        canvas.style.width = worldRows * MAP_CELL_SIZE + "px";
        canvas.style.height = worldCols * MAP_CELL_SIZE + "px";

        const mazesAsArray = Object.values(this.mazes).sort((a, b) => a.index - b.index);
        let tileIdx = 0;
        this.grid.forEach((gridLine) => {
            gridLine.forEach((tile) => {
                const maze = mazesAsArray[tileIdx];
                tileIdx++;

                if (maze.status === MazeStatus.undiscovered) return;

                this.drawMiniMaze(tile, maze);
            });
        });
    }

    private drawMiniMaze(tile: MapTile, maze: Maze) {
        const width = maze.cells[0].length * MINI_MAZE_CELL_SIZE;
        const height = maze.cells.length * MINI_MAZE_CELL_SIZE;

        const topX = tile.col * MAP_CELL_SIZE;
        const topY = tile.row * MAP_CELL_SIZE;
        const alignedX = topX + (MAP_CELL_SIZE - width) / 2;
        const alignedY = topY + (MAP_CELL_SIZE - height) / 2;

        const miniMazeRect = document.createElementNS(svgNamespace, "rect");
        miniMazeRect.setAttribute("x", alignedX + "px");
        miniMazeRect.setAttribute("y", alignedY + "px");
        miniMazeRect.setAttribute("width", width + "px");
        miniMazeRect.setAttribute("height", height + "px");
        miniMazeRect.setAttribute("fill", "white");

        tile.svg.append(miniMazeRect);
        tile.svg.addEventListener("click", () => this.goToLevelScreen(maze.id));
        if (maze.status === MazeStatus.completed) tile.svg.setAttribute("fill", "red");

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
    }

    goToLevelScreen(mazeId: string) {
        location.assign(`/src/pages/03.level.html?worldId=${worldId}&mazeId=${mazeId}`);
    }
}

new WorldMap();
