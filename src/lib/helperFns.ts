import { worldAdjectives, worldNouns } from "./constants";

export function checkLineIntersectsCircle(
    line: { ax: number; ay: number; bx: number; by: number },
    circle: { cx: number; cy: number; r: number }
) {
    let { ax, ay, bx, by } = line;
    let { cx, cy, r } = circle;

    ax -= cx;
    ay -= cy;
    bx -= cx;
    by -= cy;
    const a = (bx - ax) ** 2 + (by - ay) ** 2;
    const b = 2 * (ax * (bx - ax) + ay * (by - ay));
    const c = ax ** 2 + ay ** 2 - r ** 2;
    const disc = b ** 2 - 4 * a * c;
    if (disc <= 0) return false;
    const sqrtDisc = Math.sqrt(disc);
    const t1 = (-b + sqrtDisc) / (2 * a);
    const t2 = (-b - sqrtDisc) / (2 * a);
    if ((0 < t1 && t1 < 1) || (0 < t2 && t2 < 1)) return true;
    return false;
}

// d=√((x2 – x1)² + (y2 – y1)²).
export function getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function randRange(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const ID_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";

export function idMaker(length = 12) {
    return Array(length)
        .fill(0)
        .map((item) => ID_CHARS.split("")[Math.round(Math.random() * ID_CHARS.length)])
        .join("");
}

export function parseURLQueryParams<T>() {
    const queryParams = Object.fromEntries(new URLSearchParams(location.search).entries());
    return queryParams as T;
}

export function createWorldName() {
    // Get a random adjective
    const randomAdjective = worldAdjectives[Math.floor(Math.random() * worldAdjectives.length)];
    // Get a random noun
    const randomNoun = worldNouns[Math.floor(Math.random() * worldNouns.length)];

    // Combine them to form the world name
    return `${randomAdjective} ${randomNoun}`;
}
