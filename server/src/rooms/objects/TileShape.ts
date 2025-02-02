import { TILE_SIZE } from "../../../../util/Constants";
import { CircleEntity, MyRoomState, Tile } from "../schema/GameState";
import { RectEntity } from "./Entity";
import { Vector2 } from "./Vector2";

export const createTileShape = (
  state: MyRoomState,
  shape: string[],
  offset: Vector2,
): RectEntity => {

  shape.forEach((line, y) => {
    for (let x = 0; x < line.length; x++) {
      switch (line[x]) {
        case "a":
          state.tiles.push(
            new Tile(offset.x + x * TILE_SIZE, offset.y + y * TILE_SIZE),
          );
          break;
        case "x":
          state.collectible.push(
            new CircleEntity(offset.x + x * TILE_SIZE, offset.y + y * TILE_SIZE, 1),
          );
          break;
        case " ":
          break;
        default:
          break;
      }
    }
  });

  const width = shape[0].length * TILE_SIZE;
  const height = shape.length * TILE_SIZE;
  return new RectEntity(offset.x, offset.y, width, height);
};
