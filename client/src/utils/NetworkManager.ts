import * as Colyseus from "colyseus.js";
import { MyRoomState } from "../schema/MyRoomState";

export class NetworkManager {
  public isHost: boolean;
  public room: Colyseus.Room<MyRoomState>;
  private _client: Colyseus.Client;
  private static _instance: NetworkManager;

  private constructor() { }

  public static getInstance(): NetworkManager {
    if (this._instance == null) {
      this._instance = new NetworkManager();
    }
    return this._instance;
  }

  public initialize(): void {
    this._client = new Colyseus.Client("ws://localhost:2567"); // SWITCH TO wss://us-ewr-6371d2f0.colyseus.cloud FOR PRODUCTION
  }

  public async connectToRoom(
    name: string,
  ): Promise<Colyseus.Room<MyRoomState>> {
    try {
      this.room = await this._client.joinOrCreate("my_room", { name });
      this.registerMessageListeners();
      return this.room;
    } catch (e) {
      console.error(e);
      console.log(this._client);
      throw e;
    }
  }

  get clientPlayer() {
    return this.room.state.players.get(this.room.sessionId);
  }

  private registerMessageListeners() {
    this.room.onMessage("host", (isHost) => {
      if (isHost) {
        this.isHost = true;
      }
    })
  }
}
