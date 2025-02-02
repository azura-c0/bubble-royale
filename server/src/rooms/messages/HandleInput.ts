import { Client } from "colyseus";
import { MyRoom } from "../MyRoom";
import { BOOST_ACCELERATION, PLAYER_ACCELERATION } from "../../../../util/Constants";
import { MovePlayer } from "../../../../util/Player";
import { CollideCircles, ResolveCircleCollision, CollideCircleTile } from "../../../../util/Collision";
import { Player } from "../schema/GameState";

export const HandleInput = (
  input: InputMessage,
  player: Player
) => {
  if (player) {
    const acceleration = player.boostEngaged ? BOOST_ACCELERATION : PLAYER_ACCELERATION;

    if (input.up) {
      player.velocityY -= acceleration;
    } else if (input.down) {
      player.velocityY += acceleration;
    }

    if (input.left) {
      player.velocityX -= acceleration;
    } else if (input.right) {
      player.velocityX += acceleration;
    }

    if (input.action && player.boost > 0) {
      player.boostEngaged = true;
      player.boost--;
      console.log("Boost engaged", player.boost);
    } else {
      player.boostEngaged = false;
    }
  }
};
