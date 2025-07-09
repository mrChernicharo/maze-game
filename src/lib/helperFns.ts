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

console.log(checkLineIntersectsCircle({ ax: 0, ay: 0, bx: 100, by: 0 }, { cx: 10, cy: 9.9, r: 10 }));
