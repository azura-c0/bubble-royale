import { Room, Client } from "@colyseus/core";
import { Player, MyRoomState } from "./schema/GameState";
import { HandleInput } from "./messages/HandleInput";
import { InitializeGame } from "./messages/InitializeGame";

export class MyRoom extends Room<MyRoomState> {
  maxClients: number = 20;

  onCreate (options: any) {
    this.setState(new MyRoomState());

    InitializeGame(this);
    this.onMessage("input", (client, message: InputMessage) => HandleInput(this, client, message));
  }
  onJoin (client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player());
    console.log(client.sessionId, "joined!");
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
