import { Vector2 } from "./Vector2";

export const TileShape = (shape: string[], position: Vector2) => {
  shape.forEach((line) => {
    for (let i = 0; i < 3; i++) {
      switch (line[i]) {
        case "a":
          //Create a tile
        case "x":
          //Create a collectible
        case " ":
          //Do nothing
        default: 
          console.warn("Invalid character");
          break;
      }
    }
  });
};
