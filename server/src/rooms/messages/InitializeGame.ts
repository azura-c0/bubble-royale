import { CollideRects } from "../../../../util/Collision";
import {
  STRUCTURE_QTY,
  STRUCTURES,
  TILE_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../../../../util/Constants";
import { getRandomInt, MyRoom } from "../MyRoom";
import { RectEntity } from "../objects/Entity";
import { createTileShape } from "../objects/TileShape";
import { Vector2 } from "../objects/Vector2";
import { CircleEntity, Tile } from "../schema/GameState";

export const InitializeGame = (room: MyRoom) => {
  const entities: RectEntity[] = [];

  for (let i = 0; i < WORLD_WIDTH; i += TILE_SIZE) {
    room.state.tiles.push(new Tile(i, 0));
    room.state.tiles.push(new Tile(i, WORLD_HEIGHT - TILE_SIZE));
  }

  for (let i = 0; i < WORLD_HEIGHT; i += TILE_SIZE) {
    room.state.tiles.push(new Tile(0, i));
    room.state.tiles.push(new Tile(WORLD_WIDTH - TILE_SIZE, i));
  }

  for (let i = 0; i < STRUCTURE_QTY; i++) {
    const shape: string[] = STRUCTURES[getRandomInt(0, STRUCTURES.length - 1)];
    console.log(shape);
    const position = generateRandomPosition(entities, {
      width: shape[0].length * TILE_SIZE,
      height: shape.length * TILE_SIZE,
    });
    entities.push(createTileShape(room.state, shape, position));
  }
};

function generateRandomPosition(
  entities: RectEntity[],
  size: { width: number; height: number },
  maxAttempts = 100,
): Vector2 {
  let attempts = 0;
  let position: Vector2;
  let thisEntity: RectEntity;

  do {
    position = new Vector2(
      getRandomInt(0, WORLD_WIDTH),
      getRandomInt(0, WORLD_HEIGHT),
    );
    thisEntity = new RectEntity(
      position.x,
      position.y,
      size.width,
      size.height,
    );

    attempts++;
  } while (
    entities.some((entity) => CollideRects(entity, thisEntity)) &&
    attempts < maxAttempts
  );

  if (attempts === maxAttempts) {
    throw new Error(
      "Unable to generate a non-colliding position after maximum attempts",
    );
  }

  return position;
}
