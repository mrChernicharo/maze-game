export enum CellType {
  wall = "wall",
  ground = "ground",
  enemy = "enemy",
  powerUp = "powerUp",
  door = "door",
}

export type MazeBlueprint = number[][];

export type LineCoords = { ax: number; ay: number; bx: number; by: number };

export type CellLines = {
  top: LineCoords;
  right: LineCoords;
  bottom: LineCoords;
  left: LineCoords;
};
