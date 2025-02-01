import { CollideRects } from "../../../../util/Collision";
import { TILE_SIZE } from "../../../../util/Constants";
import { MyRoom } from "../MyRoom";
import { RectEntity } from "../objects/Entity";
import { createTileShape } from "../objects/TileShape";
import { Vector2 } from "../objects/Vector2";
import { Tile } from "../schema/GameState";

const tileShapes: string[][] = [
  ["aa   a",
   "aa   a",
   "a    a",
   "a    a",
   "ax   a",
   "a    a",
   "aa   a"],

  ["a   a",
   "a   a",
   "ax  a"],
]

export const InitializeGame = (room: MyRoom) => {
  const entities: RectEntity[] = []

  for (let i = 0; i < 5; i++) {
    const shape: string[] = Math.random() > 0.5 ? tileShapes[0] : tileShapes[1];
    const position = generateRandomPosition(entities, { width: shape[0].length * TILE_SIZE, height: shape.length * TILE_SIZE});
    entities.push(createTileShape(room.state, shape, position));
  }
};

function generateRandomPosition(entities: RectEntity[], size: { width: number, height: number }, maxAttempts = 100): Vector2 {
  let attempts = 0;
  let position: Vector2;
  let thisEntity: RectEntity;

  do {
    position = new Vector2(getRandomInt(0, 600), getRandomInt(0, 600));
    thisEntity = new RectEntity(position.x, position.y, size.width, size.height);
    console.log(thisEntity);
    attempts++;
  } while (entities.some(entity => CollideRects(entity, thisEntity)) && attempts < maxAttempts);

  if (attempts === maxAttempts) {
    throw new Error('Unable to generate a non-colliding position after maximum attempts');
  }

  return position;
}

  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
