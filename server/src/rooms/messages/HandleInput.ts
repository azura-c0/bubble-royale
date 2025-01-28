import { Client } from "colyseus";
import { MyRoom } from "../MyRoom";

export const HandleInput = (
  room: MyRoom,
  client: Client,
  message: InputMessage,
) => {
  const player = room.state.players.get(client.sessionId);
  if (player) {
    if (message.up) {
      console.log(client.sessionId, "moved to", player.x, player.y);
      player.y -= 2;
    } else if (message.down) {
      player.y += 2;
      console.log(client.sessionId, "moved to", player.x, player.y);
    }

    if (message.left) {
      player.x -= 2;
      console.log(client.sessionId, "moved to", player.x, player.y);
    } else if (message.right) {
      player.x += 2;
      console.log(client.sessionId, "moved to", player.x, player.y);
    }
  }
};
