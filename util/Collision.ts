import type { CircleEntity } from "../client/src/schema/CircleEntity";

export function CollideCircles(a: CircleEntity, b: CircleEntity) {
    const xDiff = a.x - b.x;
    const yDiff = a.y - b.y;

    const rSum = a.radius + b.radius;
    const dist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
    return dist < rSum;
}

export function ReflectCircle(a: CircleEntity, b: CircleEntity, velocityX: number, velocityY: number): [number, number] {
    const ba = [b.x - a.x, b.y - a.y];
    const dp = DotProduct(velocityX, velocityY, ba[0], ba[1]);

    return [
        velocityX - 2 * dp * ba[0],
        velocityY - 2 * dp * ba[1]
    ];
}

export function DotProduct(x1: number, y1: number, x2: number, y2: number): number {
    return x1 * x2 + y1 * y2;
}

export function ClampLength(vec: [number, number], length: number): [number, number] {
    const vecSquared = (vec[0] * vec[0]) + (vec[1] * vec[1]);
    const lengthSquared = length * length;
    if (vecSquared <= lengthSquared) {
        return vec;
    }
    const vecLength = Math.sqrt(vecSquared);

    return [vec[0] / vecLength * length, vec[1] / vecLength * length];
}