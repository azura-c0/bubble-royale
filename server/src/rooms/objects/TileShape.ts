import { CircleEntity, MyRoomState, Tile } from "../schema/GameState";
import { Vector2 } from "./Vector2";

export const createTileShape = (state: MyRoomState, shape: string[], offset: Vector2) => {
  shape.forEach((line, y) => {
    for (let x = 0; x < 4; x++) {
      switch (line[x]) {
        case "a":
          state.tiles.push(new Tile(offset.x + x, offset.y + y));
          break;
        case "x":
          state.collectible.push(new CircleEntity(offset.x + x, offset.y + y, 1));
          break;
        case " ":
          console.log("nothing was placed")
          break;
        default: 
          console.warn("Invalid character");
          break;
      }
    }
  });

  console.log(`Tile shape created at ${offset.x}, ${offset.y}`);
};
