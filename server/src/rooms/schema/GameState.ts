import { Schema, MapSchema, type } from "@colyseus/schema";


export class Player extends Schema {
  @type("string") name: string = "";
  @type("number") x: number = 512;
  @type("number") y: number = 384
  @type("number") rotation: number = 0;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") currentTurn = 0;
}
