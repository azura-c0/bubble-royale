import type { PlayerPrefab } from "../client/src/objects/PlayerPrefab";
import { ClampLength } from "./Collision";
import { PLAYER_FRICTION, PLAYER_MAX_VELOCITY } from "./Constants";

export function MovePlayer(player: {x: number, y: number, velocityX: number, velocityY: number}): void {
    const clampVec = ClampLength([player.velocityX, player.velocityY], PLAYER_MAX_VELOCITY);
    player.x += clampVec[0];
    player.y += clampVec[1];
    clampVec[0] *= PLAYER_FRICTION;
    clampVec[1] *= PLAYER_FRICTION;
    player.velocityX = clampVec[0];
    player.velocityY = clampVec[1];

}