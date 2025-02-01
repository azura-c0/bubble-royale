import { Room, Client } from "@colyseus/core";
import { Player, MyRoomState } from "./schema/GameState";
import { HandleInput } from "./messages/HandleInput";
import { InitializeGame } from "./messages/InitializeGame";
import { CollideCircles, CollideCircleTile, ResolveCircleCollision } from "../../../util/Collision";
import { MovePlayer } from "../../../util/Player";

export class MyRoom extends Room<MyRoomState> {
  maxClients: number = 20;

  onCreate (options: any) {
    this.setState(new MyRoomState());
    this.clock.start()
    this.clock.setInterval(() => {
      this.state.players.forEach((player) => {
        this.state.players.forEach((otherPlayer) => {
          if (player === otherPlayer) {
            return;
          }
          if (CollideCircles(otherPlayer, player)) {
            ResolveCircleCollision(otherPlayer, player);
          }
        });

        this.state.tiles.forEach((tile) => {
          const [collided, normal] = CollideCircleTile(player, tile);

          if (collided) {
            // console.log(`collided with tile ${normal}`);
          }
        });
        MovePlayer(player, this.clock.deltaTime);
      });

    }, 100);
    InitializeGame(this);
    this.onMessage("input", (client, message: InputMessage) => HandleInput(this, client, message));
  }
  onJoin (client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player());

    this.state.players.get(client.sessionId).x = Math.random() * 800;
    this.state.players.get(client.sessionId).y = Math.random() * 600;
    console.log(client.sessionId, "joined!");
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
