import { Room, Client } from "@colyseus/core";
import { Player, MyRoomState } from "./schema/GameState";
import { HandleInput } from "./messages/HandleInput";

export class MyRoom extends Room<MyRoomState> {
  maxClients: number = 4;

  onCreate (options: any) {
    this.setState(new MyRoomState());

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
