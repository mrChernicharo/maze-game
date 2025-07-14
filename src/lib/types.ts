export enum CellType {
    wall = "wall",
    ground = "ground",
    enemy = "enemy",
    powerUp = "powerUp",
    door = "door",
}

export enum Direction {
    top = "top",
    right = "right",
    bottom = "bottom",
    left = "left",
}

export enum DirectionDiag {
    top = "top",
    right = "right",
    bottom = "bottom",
    left = "left",
    tr = "tr",
    tl = "tl",
    br = "br",
    bl = "bl",
}

export enum GameItem {
    coin = "coin",
    powerUp = "powerUp",
}

export enum MazeStatus {
    undiscovered = "undiscovered",
    discovered = "discovered",
    completed = "completed",
}

export enum CorridorStatus {
    undiscovered = "undiscovered",
    discovered = "discovered",
}

export type MazeBlueprint = number[][];

export type LineCoords = { ax: number; ay: number; bx: number; by: number };

export type CellLines = {
    top: LineCoords;
    right: LineCoords;
    bottom: LineCoords;
    left: LineCoords;
};

/*********/

export interface World {
    id: string;
    index: number;
    name: string;
    size: [number, number];
}

export type MazeCell = { row: number; col: number; value: number };

export interface Maze {
    id: string;
    index: number;
    cells: number[][];
    status: MazeStatus;
    // cells: MazeCell[][];
}

export type Walls = { top: boolean; right: boolean; bottom: boolean; left: boolean };

export type Corridor = { id: string; status: CorridorStatus; tileIndices: [number, number] };
