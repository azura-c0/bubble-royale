import { MyRoom } from "../MyRoom";
import { createTileShape } from "../objects/TileShape";
import { Vector2 } from "../objects/Vector2";
import { Tile } from "../schema/GameState";

const tileShapes: string[][] = [
  ["aa a",
   "aa a",
   "a  a",
   "a  a",
   "ax a",
   "a  a",
   "aa a"],

  ["a  a",
   "a  a",
   "ax a"],
]

export const InitializeGame = (room: MyRoom) => { 
  for (let i = 0; i < 10; i++) {
    const shape: string[] = Math.random() > 0.5 ? tileShapes[0] : tileShapes[1];
    createTileShape(room.state, shape, new Vector2(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)));
  }
};
