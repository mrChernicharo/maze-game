import { idMaker } from "./helperFns";
import { CellType, Direction, DirectionDiag, type World } from "./types";

export const cellTypesArr = [CellType.wall, CellType.ground, CellType.enemy, CellType.powerUp, CellType.door];

export const COLORS = {
    wall: "#363636",
    door: "#f9af00",
    ground: "#cdcdcd",
    enemy: "#ff0000",
    powerUp: "#0056ff",
};

export const COLOR_ARR = [COLORS.wall, COLORS.ground, COLORS.enemy, COLORS.powerUp, COLORS.door];

export const MAZE_CELL_SIZE = 20;
export const MAP_CELL_SIZE = 100;
export const MINI_MAZE_CELL_SIZE = 4;
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

export const rowsMinMax = [4, 8];
export const colsMinMax = [4, 8];

export const initialWorld: World = {
    id: idMaker(),
    index: 0,
    name: "The Adventure Begins",
    size: [2, 1],
};

export const worldAdjectives = [
    "Ancient",
    "Mystic",
    "Whispering",
    "Forgotten",
    "Shimmering",
    "Sparkling",
    "Enchanted",
    "Silent",
    "Lost",
    "Golden",
    "Silver",
    "Shadowy",
    "Bright",
    "Dark",
    "Eerie",
    "Giggling",
    "Silly",
    "Wobbly",
    "Fluffy",
    "Bouncy",
    "Grumpy",
    "Chuckle",
    "Sneaky",
    "Jolly",
    "Whimsical",
    "Cosmic",
    "Galactic",
    "Stardust",
    "Dreamy",
    "Velvet",
    "Crystal",
    "Emerald",
    "Obsidian",
    "Azure",
    "Crimson",
    "Hollow",
    "Echoing",
    "Sunken",
    "Floating",
    "Cloudy",
    "Spooky",
    "Creepy",
    "Tiny",
    "Giant",
    "Sleepy",
    "Wandering",
    "Singing",
    "Dancing",
    "Jumping",
    "Tickle",
];

export const worldNouns = [
    "Forest",
    "Valley",
    "Mountain",
    "River",
    "Lake",
    "Plain",
    "Desert",
    "Swamp",
    "Island",
    "Canyon",
    "Peak",
    "Glade",
    "Grove",
    "Lagoon",
    "Oasis",
    "Realm",
    "Kingdom",
    "Dimension",
    "Expanse",
    "Sanctuary",
    "Wonderland",
    "Dreamscape",
    "Cloudland",
    "Starfield",
    "Abyss",
    "Pillows",
    "Socks",
    "Pickles",
    "Teacups",
    "Waffles",
    "Bunnies",
    "Gnomes",
    "Dragons",
    "Unicorns",
    "Robots",
    "Whispers",
    "Echoes",
    "Glimmers",
    "Shadows",
    "Lights",
    "Cove",
    "Spire",
    "Falls",
    "Meadow",
    "Plateau",
    "Towers",
    "Caverns",
    "Ruins",
    "Citadel",
    "Nexus",
];
