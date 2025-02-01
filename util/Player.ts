import type { PlayerPrefab } from "../client/src/objects/PlayerPrefab";
import { ClampLength, Vec2dLen } from "./Collision";
import { PLAYER_FRICTION, PLAYER_MAX_VELOCITY } from "./Constants";

const FRICTION_PER_SECOND = PLAYER_FRICTION;
const FRICTION_RATE = -Math.log(FRICTION_PER_SECOND);

export function MovePlayer(player: { x: number, y: number, velocityX: number, velocityY: number }, dt: number): void {
    
    const clampVec = ClampLength([player.velocityX, player.velocityY], PLAYER_MAX_VELOCITY);
    const speed = Vec2dLen(clampVec);
    console.log("speed", speed);
    player.x += clampVec[0] * dt;
    player.y += clampVec[1] * dt;
    const friction = Math.exp(-FRICTION_RATE * dt);
    clampVec[0] *= friction;
    clampVec[1] *= friction;
    player.velocityX = clampVec[0];
    player.velocityY = clampVec[1];

}
