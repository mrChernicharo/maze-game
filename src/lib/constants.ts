import { CellType, Direction, DirectionDiag } from "./types";

export const cellTypesArr = [CellType.wall, CellType.ground, CellType.enemy, CellType.powerUp, CellType.door];

export const COLORS = {
    wall: "#363636",
    door: "#f9af00",
    ground: "#cdcdcd",
    enemy: "#ff0000",
    powerUp: "#0056ff",
};

export const MAZE_CELL_SIZE = 20;
export const MAP_CELL_SIZE = 100;
export const MINI_MAZE_CELL_SIZE = 5;
export const CELL_SIZE = 50;
export const PLAYER_RADIUS = 14;
export const ENEMY_RADIUS = 12;
export const COIN_RADIUS = 6;
export const POWER_UP_RADIUS = 12;

export const svgNamespace = "http://www.w3.org/2000/svg";

export const oppositeDirections = {
    [Direction.top]: Direction.bottom,
    [Direction.bottom]: Direction.top,
    [Direction.left]: Direction.right,
    [Direction.right]: Direction.left,
};
