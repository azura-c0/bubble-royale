import { Room, Client } from "@colyseus/core";
import { Player, MyRoomState } from "./schema/GameState";
import { HandleInput } from "./messages/HandleInput";
import { InitializeGame } from "./messages/InitializeGame";
import {
  CollideCircles,
  CollideCircleTile,
  ResolveCircleCollision,
  ResolveCircleTileCollision,
} from "../../../util/Collision";
import { MovePlayer } from "../../../util/Player";
import { IJoinOptions } from "../../../util/types";

export class MyRoom extends Room<MyRoomState> {
  maxClients: number = 20;
  elapsedTime: number = 0;
  readonly fixedTimeStep: number = 1000 / 60;

  onCreate(options: any) {
    this.setState(new MyRoomState());
    this.setSimulationInterval((deltaTime) => {
      this.elapsedTime += deltaTime;

      while (this.elapsedTime >= this.fixedTimeStep) {
        this.elapsedTime -= this.fixedTimeStep;
        this.fixedUpdate(this.fixedTimeStep);
      }
    });

    InitializeGame(this);
    this.onMessage("input", (client, message: InputMessage) => {
      const player = this.state.players.get(client.sessionId);
      player.inputQueue.push(message);
    });
  }

  fixedUpdate(delta: number) {
    this.state.players.forEach((player) => {
      let input: InputMessage;

      while ((input = player.inputQueue.shift())) {
        HandleInput(input, player);
      }

      // Player collisions
      this.state.players.forEach((otherPlayer) => {
        if (otherPlayer === player) return;

        if (CollideCircles(player, otherPlayer)) {
          ResolveCircleCollision(player, otherPlayer);
        }
      });

      // Tile collisions
      this.state.tiles.forEach((tile) => {
        const [hit, n] = CollideCircleTile(player, tile);
        if (hit) {
          ResolveCircleTileCollision(player, tile, n);
          return;
        }
      });

      MovePlayer(player, delta, player.boostEngaged);
    });
  }

  onJoin(client: Client, options: IJoinOptions) {
    this.state.players.set(client.sessionId, new Player(options.name));

    this.state.players.get(client.sessionId).x = Math.random() * 800;
    this.state.players.get(client.sessionId).y = Math.random() * 600;
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
