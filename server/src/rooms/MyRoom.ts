import { Room, Client } from "@colyseus/core";
import { ArraySchema, MapSchema } from "@colyseus/schema";
import { Player, MyRoomState, Tile, CircleEntity } from "./schema/GameState";
import { HandleInput } from "./messages/HandleInput";
import { InitializeGame } from "./messages/InitializeGame";
import {
  CollideCircles,
  CollideCircleTile,
  ResolveCircleCollision,
  ResolveCircleTileCollision,
} from "../../../util/Collision";
import { MovePlayer } from "../../../util/Player";
import { IPlayerData } from "../../../util/types";
import {
  BOOST_INCREASE,
  BOOST_MAX,
  BUBBLE_SHRINK_RATE,
  BUBBLE_SPEED,
  BUBBLE_STATE_CHANGE_INTERVAL,
  MAX_BUBBLE_RADIUS,
  PLAYER_OXYGEN_RATE,
  PLAYER_RADIUS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../../../util/Constants";

type BubbleDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right";

export class MyRoom extends Room<MyRoomState> {
  maxClients: number = 20;
  elapsedTime: number = 0;
  readonly fixedTimeStep: number = 1000 / 60;
  private _winner: string;
  private _hostClient: Client;
  private _bubbleDirection: BubbleDirection = "up";

  onCreate() {
    this.setState(new MyRoomState());
    this.onMessage("amIHost", (client) =>
      client.send("host", this._hostClient === client),
    );

    this.onMessage<string>("message", (client, message) => {
      const name = this.state.players.get(client.sessionId).name;
      console.log(`${name}: ${message}`);
      this.state.messages.push(`${name}: ${message}`);
    });

    this.onMessage("start", (client) => {
      if (client === this._hostClient) {
        this.start();
        this.state.gameStarted = true;
        this.setPrivate(true);
      }
    });
  }

  start() {
    this.setSimulationInterval((deltaTime) => {
      this.elapsedTime += deltaTime;

      while (this.elapsedTime >= this.fixedTimeStep) {
        this.elapsedTime -= this.fixedTimeStep;
        this.fixedUpdate(this.fixedTimeStep);
      }
    });

    this.clock.setInterval(() => {
      const randomInt = getRandomInt(0, 7);
      switch (randomInt) {
        case 0:
          this._bubbleDirection = "up";
          break;
        case 1:
          this._bubbleDirection = "down";
          break;
        case 2:
          this._bubbleDirection = "left";
          break;
        case 3:
          this._bubbleDirection = "right";
          break;
        case 4:
          this._bubbleDirection = "up-left";
          break;
        case 5:
          this._bubbleDirection = "up-right";
          break;
        case 6:
          this._bubbleDirection = "down-left";
          break;
        case 7:
          this._bubbleDirection = "down-right";
          break;
      }
    }, BUBBLE_STATE_CHANGE_INTERVAL);

    InitializeGame(this);
    this.onMessage("input", (client, message: InputMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.inputQueue.push(message);
      }
    });
  }

  fixedUpdate(delta: number) {
    // Bubble logic
    this.bubbleMovement(this.state.bubble);

    // Handle Input
    this.state.players.forEach((player, session) => {
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
      this.handlePlayerCollectibleCollisions(player);
      this.checkIfPlayerIsInBubble(session, player);
    });
  }

  private handlePlayerCollectibleCollisions(player: Player) {
    this.state.collectible.forEach((collectible, i) => {
      if (
        player.boost < BOOST_MAX &&
        CollideCircles(player, { velocityX: 0, velocityY: 0, ...collectible })
      ) {
        player.boost += BOOST_INCREASE;
        if (player.boost > BOOST_MAX) {
          player.boost = BOOST_MAX;
        }
        this.state.collectible.deleteAt(i);
      }
    });
  }

  private checkIfPlayerIsInBubble(session: string, player: Player) {
    if (
      !CollideCircles(
        { velocityX: 0, velocityY: 0, ...this.state.bubble },
        player,
      )
    ) {
      player.oxygen -= PLAYER_OXYGEN_RATE;
      if (player.oxygen <= 0) {
        this.state.players.delete(session);
      }
    } else {
      player.oxygen += PLAYER_OXYGEN_RATE * 1.5;
      if (player.oxygen > 100) {
        player.oxygen = 100;
      }
    }
    if (!this._winner) {
      this.checkWinCondition();
    }
  }

  private checkWinCondition() {
    if (this.state.players.size === 1) {
      this._winner = this.state.players.values().next().value.name;
      this.broadcast("win", this._winner);
    }
  }

  onJoin(client: Client, options: IPlayerData) {
    this.state.players.set(
      client.sessionId,
      new Player(options.name, options.color),
    );

    if (this.clients.length === 1) {
      this._hostClient = client;
    }

    const position = generateRandomPosition(
      this.state.players,
      this.state.tiles,
    );

    const player = this.state.players.get(client.sessionId);
    player.x = position.x;
    player.y = position.y;
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    if (this._hostClient === client) {
      this._hostClient = this.clients[0];
      this._hostClient.send("host", true);
    }
    this.state.players.delete(client.sessionId);
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  bubbleMovement(bubble: CircleEntity) {
    switch (this._bubbleDirection) {
      case "up":
        if (bubble.y - bubble.radius <= 0) {
          this._bubbleDirection = "down";
        }
        bubble.y -= BUBBLE_SPEED;
        break;
      case "down":
        if (bubble.y + bubble.radius >= WORLD_HEIGHT) {
          this._bubbleDirection = "up";
        }
        bubble.y += BUBBLE_SPEED;
        break;
      case "left":
        if (bubble.x - bubble.radius <= 0) {
          this._bubbleDirection = "right";
        }
        bubble.x -= BUBBLE_SPEED;
        break;
      case "right":
        if (bubble.x + bubble.radius >= WORLD_WIDTH) {
          this._bubbleDirection = "left";
        }
        bubble.x += BUBBLE_SPEED;
        break;
      case "up-left":
        if (bubble.x - bubble.radius <= 0 || bubble.y - bubble.radius <= 0) {
          this._bubbleDirection = "down-right";
        }
        bubble.x -= BUBBLE_SPEED;
        bubble.y -= BUBBLE_SPEED;
        break;
      case "up-right":
        if (
          bubble.x + bubble.radius >= WORLD_WIDTH ||
          bubble.y - bubble.radius <= 0
        ) {
          this._bubbleDirection = "down-left";
        }
        bubble.x += BUBBLE_SPEED;
        bubble.y -= BUBBLE_SPEED;
        break;
      case "down-left":
        if (
          bubble.x - bubble.radius <= 0 ||
          bubble.y + bubble.radius >= WORLD_HEIGHT
        ) {
          this._bubbleDirection = "up-right";
        }
        bubble.x -= BUBBLE_SPEED;
        bubble.y += BUBBLE_SPEED;
        break;
      case "down-right":
        if (
          bubble.x + bubble.radius >= WORLD_WIDTH ||
          bubble.y + bubble.radius >= WORLD_HEIGHT
        ) {
          this._bubbleDirection = "up-left";
        }
        bubble.x += BUBBLE_SPEED;
        bubble.y += BUBBLE_SPEED;
        break;
    }

    bubble.radius *= BUBBLE_SHRINK_RATE;
  }
}

function generateRandomPosition(
  playerEntities: MapSchema<Player>,
  tiles: ArraySchema<Tile>,
  maxAttempts = 100,
) {
  let attempts = 0;
  let detectedCollision = false;
  let position: { x: number; y: number };
  do {
    position = {
      x: getRandomInt(
        WORLD_WIDTH / 2 - MAX_BUBBLE_RADIUS / 2,
        WORLD_WIDTH / 2 + MAX_BUBBLE_RADIUS / 2,
      ),
      y: getRandomInt(
        WORLD_HEIGHT / 2 - MAX_BUBBLE_RADIUS / 2,
        WORLD_HEIGHT / 2 + MAX_BUBBLE_RADIUS / 2,
      ),
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
      tiles.forEach((tile) => {
        if (
          CollideCircleTile(
            {
              x: position.x,
              y: position.y,
              radius: PLAYER_RADIUS,
              velocityX: 0,
              velocityY: 0,
            },
            tile,
          )[0]
        ) {
          detectedCollision = true;
        }
      });
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
