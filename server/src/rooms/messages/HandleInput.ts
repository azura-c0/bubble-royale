import { Client } from "colyseus";
import { MyRoom } from "../MyRoom";
import { PLAYER_ACCELERATION } from "../../../../util/Constants";
import { MovePlayer } from "../../../../util/Player";
import { CollideCircles, ResolveCircleCollision, CollideCircleTile } from "../../../../util/Collision";
import { Player } from "../schema/GameState";

export const HandleInput = (
  input: InputMessage,
  player: Player
) => {
  if (player) {
    if (input.up) {
      player.velocityY -= PLAYER_ACCELERATION;
    } else if (input.down) {
      player.velocityY += PLAYER_ACCELERATION;
    }

    if (input.left) {
      player.velocityX -= PLAYER_ACCELERATION;
    } else if (input.right) {
      player.velocityX += PLAYER_ACCELERATION;
    }
  }
};
