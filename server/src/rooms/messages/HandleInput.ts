import { Client } from "colyseus";
import { MyRoom } from "../MyRoom";
import { PLAYER_ACCELERATION } from "../../../../util/Constants";
import { MovePlayer } from "../../../../util/Player";
import { CollideCircles, ResolveCircleCollision, CollideCircleTile } from "../../../../util/Collision";

export const HandleInput = (
  room: MyRoom,
  client: Client,
  message: InputMessage,
) => {
  const player = room.state.players.get(client.sessionId);
  if (player) {
    if (message.up) {
      player.velocityY -= PLAYER_ACCELERATION;
    } else if (message.down) {
      player.velocityY += PLAYER_ACCELERATION;
    }

    if (message.left) {
      player.velocityX -= PLAYER_ACCELERATION;
    } else if (message.right) {
      player.velocityX += PLAYER_ACCELERATION;
    }

    MovePlayer(player, room.clock.deltaTime);

    room.state.players.forEach((otherPlayer) => {
      if (otherPlayer === player) return;
      if (CollideCircles(otherPlayer, player)) {
        ResolveCircleCollision(otherPlayer, player);
      }
    });

    room.state.tiles.forEach((tile) => {
      const [collided, normal] = CollideCircleTile(player, tile);

      if (collided) {
        console.log(`collided with tile ${normal}`);
      }
    });
  }
};
