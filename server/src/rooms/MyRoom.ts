import { Room, Client } from "@colyseus/core";
import { MapSchema } from "@colyseus/schema";
import { Player, MyRoomState } from "./schema/GameState";
import { HandleInput } from "./messages/HandleInput";
import { InitializeGame } from "./messages/InitializeGame";
import {
  CollideCircles,
  CollideCircleTile,
  ResolveCircleCollision,
  ResolveCircleTileCollision,
} from "../../../util/Collision";
import { MovePlayer } from "../../../util/Player";
import { IJoinOptions } from "../../../util/types";
import {
  MAX_BUBBLE_RADIUS,
  PLAYER_RADIUS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../../../util/Constants";

export class MyRoom extends Room<MyRoomState> {
  maxClients: number = 20;
  elapsedTime: number = 0;
  readonly fixedTimeStep: number = 1000 / 60;

  onCreate(options: any) {
    this.setState(new MyRoomState());
    this.setSimulationInterval((deltaTime) => {
      this.elapsedTime += deltaTime;

      while (this.elapsedTime >= this.fixedTimeStep) {
        this.elapsedTime -= this.fixedTimeStep;
        this.fixedUpdate(this.fixedTimeStep);
      }
    });

    InitializeGame(this);
    this.onMessage("input", (client, message: InputMessage) => {
      const player = this.state.players.get(client.sessionId);
      player.inputQueue.push(message);
    });
  }

  fixedUpdate(delta: number) {
    this.state.players.forEach((player) => {
      let input: InputMessage;

      while ((input = player.inputQueue.shift())) {
        HandleInput(input, player);
      }

      // Player collisions
      this.state.players.forEach((otherPlayer) => {
        if (otherPlayer === player) return;

        if (CollideCircles(player, otherPlayer)) {
          ResolveCircleCollision(player, otherPlayer);
        }
      });

      // Tile collisions
      this.state.tiles.forEach((tile) => {
        const [hit, n] = CollideCircleTile(player, tile);
        if (hit) {
          ResolveCircleTileCollision(player, tile, n);
          return;
        }
      });

      MovePlayer(player, delta, player.boostEngaged);
    });
  }

  onJoin(client: Client, options: IJoinOptions) {
    this.state.players.set(client.sessionId, new Player(options.name));

    const position = generateRandomPosition(this.state.players);
    const player = this.state.players.get(client.sessionId);
    player.x = position.x;
    player.y = position.y;
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}

function generateRandomPosition(
  playerEntities: MapSchema<Player>,
  maxAttempts = 100,
) {
  let attempts = 0;
  let detectedCollision = false;
  let position: { x: number; y: number };
  do {
    position = {
      x: getRandomInt((WORLD_WIDTH / 2) - (MAX_BUBBLE_RADIUS / 2), (WORLD_WIDTH / 2) + (MAX_BUBBLE_RADIUS / 2)),
      y: getRandomInt((WORLD_HEIGHT / 2) - (MAX_BUBBLE_RADIUS / 2), (WORLD_HEIGHT / 2) + (MAX_BUBBLE_RADIUS / 2)),
    };
    detectedCollision = false;
    playerEntities.forEach((player) => {
      if (
        CollideCircles(player, {
          x: position.x,
          y: position.y,
          radius: PLAYER_RADIUS,
          velocityX: 0,
          velocityY: 0,
        })
      ) {
        detectedCollision = true;
      }
    });
    attempts++;
  } while (detectedCollision && attempts < maxAttempts);
  if (attempts === maxAttempts) {
    throw new Error(
      "Unable to generate a non-colliding position after maximum attempts",
    );
  }
  return position;
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
