import { MyRoom } from "../MyRoom";
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
    room.state.tiles.push(new Tile());
  }

};
