import type { CircleEntity } from "../client/src/schema/CircleEntity";

type EzVec = [number, number];
type MovingCircle = {
    x: number,
    y: number,
    radius: number,
    velocityX: number,
    velocityY: number
};

export function CollideCircles(a: MovingCircle, b: MovingCircle) {
    const xDiff = a.x - b.x;
    const yDiff = a.y - b.y;

    const rSum = a.radius + b.radius;
    const dist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
    return dist < rSum;
}

export function DotProduct(a: EzVec, b: EzVec): number {
    return a[0] * b[0] + a[1] * b[1];
}

export function ClampLength(vec: EzVec, length: number): [number, number] {
    const vecSquared = (vec[0] * vec[0]) + (vec[1] * vec[1]);
    const lengthSquared = length * length;
    if (vecSquared <= lengthSquared) {
        return vec;
    }
    const vecLength = Math.sqrt(vecSquared);

    return [vec[0] / vecLength * length, vec[1] / vecLength * length];
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

    n[0] /= nLen;
    n[1] /= nLen;

    const relVel: EzVec = [a.velocityX - b.velocityX, a.velocityY - b.velocityY];

    const reflected = Reflect(relVel, n);
    a.velocityX = reflected[0];
    a.velocityY = reflected[1];
    b.velocityX = -reflected[0];
    b.velocityY = -reflected[1];
}
