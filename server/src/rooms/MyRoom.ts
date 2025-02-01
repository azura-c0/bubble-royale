import { Room, Client } from "@colyseus/core";
import { Player, MyRoomState } from "./schema/GameState";
import { HandleInput } from "./messages/HandleInput";
import { InitializeGame } from "./messages/InitializeGame";

export class MyRoom extends Room<MyRoomState> {
  maxClients: number = 20;

  onCreate (options: any) {
    this.setState(new MyRoomState());
    this.clock.start();
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
