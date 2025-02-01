import type { CircleEntity } from "../client/src/schema/CircleEntity";
import type { Tile } from "../client/src/schema/Tile";

type EzVec = [number, number];
type MovingCircle = {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function CollideCircles(a: MovingCircle, b: MovingCircle) {
  const xDiff = a.x - b.x;
  const yDiff = a.y - b.y;

  const rSum = a.radius + b.radius;
  const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  return dist < rSum;
}

export function CollideCircleTile(circle: CircleEntity, tile: Tile) {

}

export function DotProduct(a: EzVec, b: EzVec): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function Vec2dLen(vec: EzVec): number {
    return Math.sqrt((vec[0] * vec[0]) + (vec[1] * vec[1]));
}

export function Vec2dNormal(vec: EzVec): EzVec {
    const len = Vec2dLen(vec);
    return [vec[0] / len, vec[1] / len];
}

export function Vec2dScal(vec: EzVec, scale: number): EzVec {
    return [vec[0] * scale, vec[1] * scale]
}

export function ClampLength(vec: EzVec, length: number): [number, number] {
  const vecSquared = vec[0] * vec[0] + vec[1] * vec[1];
  const lengthSquared = length * length;
  if (vecSquared <= lengthSquared) {
    return vec;
  }
  const vecLength = Math.sqrt(vecSquared);

  return [(vec[0] / vecLength) * length, (vec[1] / vecLength) * length];
}

function Reflect(a: EzVec, n: EzVec) {
    const dp = DotProduct(a, n);
    return [
         a[0] - 2 * dp * n[0],
        a[1] - 2 * dp * n[1]
    ];
}

export function ResolveCircleCollision(a: MovingCircle, b: MovingCircle) {
    const n: EzVec = [a.x - b.x, a.y - b.y];
    const nLen = Math.sqrt(n[0] * n[0] + n[1] * n[1]);
    const nNormalized = [n[0] / nLen, n[1] / nLen];

    const rSum = a.radius + b.radius;
    const diff = rSum - nLen;

    a.x += nNormalized[0] * (diff / 2);
    a.y += nNormalized[1] * (diff / 2);

    b.x -= nNormalized[0] * (diff / 2);
    b.y += nNormalized[1] * (diff / 2);

    n[0] /= nLen;
    n[1] /= nLen;

    const relVel: EzVec = [a.velocityX - b.velocityX, a.velocityY - b.velocityY];

    const reflected = Reflect(relVel, n);
    a.velocityX = reflected[0] * 0.8;
    a.velocityY = reflected[1] * 0.8;
    b.velocityX = -reflected[0] * 0.8;
    b.velocityY = -reflected[1] * 0.8;
}

export function CollideRects(a: Rect, b: Rect) {
  const collided = a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

  console.log(collided);
  return collided;

}
