import * as Colyseus from "colyseus.js";
import { MyRoomState } from "../schema/MyRoomState";

export class NetworkManager {
  public room: Colyseus.Room<MyRoomState>;
  private _client: Colyseus.Client;
  private static _instance: NetworkManager;

  private constructor() {}

  public static getInstance(): NetworkManager {
    if (this._instance == null) {
      this._instance = new NetworkManager();
    }
    return this._instance;
  }

  public initialize(): void {
    this._client = new Colyseus.Client(import.meta.env.GAME_SERVER); // SWITCH TO wss://us-ewr-6371d2f0.colyseus.cloud FOR PRODUCTION
  }

  public async connectToRoom(
    name: string,
    color: string,
    action: "host" | "join" | "find",
    roomId?: string,
  ): Promise<Colyseus.Room<MyRoomState> | unknown> {
    try {
      switch (action) {
        case "host":
          this.room = await this._client.create("my_room", {
            name,
            color,
          });
          break;
        case "find":
          this.room = await this._client.joinOrCreate("my_room", {
            name,
            color,
          });
          break;
        case "join":
          if (!roomId) {
            throw new Error("Room ID is required for find action");
          }
          this.room = await this._client.joinById(roomId, {
            name,
            color,
          });
          break;
      }
      return this.room;
    } catch (e) {
      return e;
    }
  }

  get clientPlayer() {
    return this.room.state.players.get(this.room.sessionId);
  }
}
