import type { PlayerPrefab } from "../client/src/objects/PlayerPrefab";
import { ClampLength } from "./Collision";
import { PLAYER_FRICTION, PLAYER_MAX_VELOCITY } from "./Constants";

export function MovePlayer(player: {x: number, y: number, velocityX: number, velocityY: number}, dt: number): void {
    const clampVec = ClampLength([player.velocityX, player.velocityY], PLAYER_MAX_VELOCITY);
    player.x += clampVec[0] * dt;
    player.y += clampVec[1] * dt;
    clampVec[0] *= Math.pow(PLAYER_FRICTION, dt);
    clampVec[1] *= Math.pow(PLAYER_FRICTION, dt);
    player.velocityX = clampVec[0];
    player.velocityY = clampVec[1];

}