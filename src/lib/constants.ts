import { CellType } from "./types";

export const cellTypesArr = [CellType.wall, CellType.ground, CellType.enemy, CellType.powerUp, CellType.door];

export const COLORS = {
  wall: "#363636",
  door: "#f9af00",
  ground: "#cdcdcd",
  enemy: "#ff0000",
  powerUp: "#0056ff",
};

export const MAZE_CELL_SIZE = 20;
export const CELL_SIZE = 50;
export const PLAYER_RADIUS = 18;

export const svgNamespace = "http://www.w3.org/2000/svg";
