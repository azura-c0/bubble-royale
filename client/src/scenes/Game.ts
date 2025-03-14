import { Scene } from "phaser";
import { NetworkManager } from "../utils/NetworkManager";
import { InputHandler } from "../utils/InputHandler";
import { ClientPlayer, PlayerPrefab } from "../objects/PlayerPrefab";
import { Player } from "../schema/Player";
import {
  CollideCircles,
  CollideCircleTile,
  ResolveCircleCollision,
  ResolveCircleTileCollision,
} from "../../../util/Collision";
import { Tile } from "../schema/Tile";
import { MovePlayer } from "../../../util/Player";
import {
  MAX_BUBBLE_RADIUS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../../../util/Constants";
import { CircleEntity } from "../schema/CircleEntity";
import { GameChat } from "../objects/GameChat";

const FIXED_TIMESTEP = 1000 / 60;
export class Game extends Scene {
  public inputHandler: InputHandler;
  private _accumulator = 0;
  private _clientPlayer: ClientPlayer;
  private _tiles: Phaser.GameObjects.Sprite[] = [];
  private _collectibles: Record<number, Phaser.GameObjects.Sprite> = {};
  private _playerEntities: Map<string, PlayerPrefab> = new Map<
    string,
    PlayerPrefab
  >();
  private miniMap: Phaser.Cameras.Scene2D.Camera;
  private _bubble: Phaser.GameObjects.Arc;
  private _cameraIterator = 0;

  private shardEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: "Game", active: false });
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("astronaut", "astronaut.png");
    this.load.image("tile", "tile.png");
    this.load.image("smoke", "smoke.png");
    this.load.image("boostSmoke", "boostSmoke.png");
    this.load.image("arrow", "arrow.png");
    this.load.image("collectible", "collectible.png");
    this.load.image("shards", "shards.png");
    this.load.spritesheet("blood", "blood.png", {
      frameWidth: 12,
      frameHeight: 12,
      startFrame: 0,
      endFrame: 4,
    });

    // Audio
    this.load.audio("booster1", "booster1.mp3");
    this.load.audio("booster2", "booster2.mp3");

    for (let i = 1; i <= 3; i++) {
      this.load.audio("choking" + i, "choking" + i + ".mp3");
    }

    for (let i = 1; i <= 3; i++) {
      this.load.audio("collect" + i, "collect" + i + ".mp3");
    }

    for (let i = 1; i <= 7; i++) {
      this.load.audio("death" + i, "death" + i + ".mp3");
    }

    for (let i = 1; i <= 8; i++) {
      this.load.audio("grunt" + i, "grunt" + i + ".mp3");
    }

    this.load.audio("jetpack1", "Jetpack1.mp3");
    this.load.audio("jetpack2", "jetpack2.mp3");
  }

  async create() {
    this.cameras.main.roundPixels = false;

    new GameChat(this);

    this.inputHandler = new InputHandler(this, {
      up: ["W", Phaser.Input.Keyboard.KeyCodes.UP],
      down: ["S", Phaser.Input.Keyboard.KeyCodes.DOWN],
      left: ["A", Phaser.Input.Keyboard.KeyCodes.LEFT],
      right: ["D", Phaser.Input.Keyboard.KeyCodes.RIGHT],
      action: [Phaser.Input.Keyboard.KeyCodes.SHIFT],
    });
    const bg = this.add.tileSprite(
      0,
      0,
      WORLD_WIDTH * 2,
      WORLD_HEIGHT * 2,
      "background",
    );
    this.miniMap = this.cameras
      .add(16, 16, 200, 200)
      .setZoom(0.1)
      .setName("mini");
    this.miniMap.ignore(bg);
    this.miniMap.backgroundColor =
      Phaser.Display.Color.HexStringToColor("#111");
    //bg.setScale(3, 3);
    this.inputHandler.startListening();
    this.initializePlayerEntities();
    this.initalizeTiles();
    this.initializeCollectibles();
    this._bubble = this.add.arc(
      0,
      0,
      MAX_BUBBLE_RADIUS,
      0,
      360,
      false,
      0x0000ff,
      0.2,
    );
    this.miniMap.centerOn(this._bubble.x, this._bubble.y);
    this.sound.volume = 0.5;

    this.shardEmitter = this.add.particles(0, 0, "shards", {
      lifespan: 500,
      emitting: false,
      frequency: 100,
      speed: { min: 50, max: 150 },
      scale: { start: 1.0, end: 0 },
      rotate: { start: 0, end: 360 },
    });
    this.shardEmitter.setDepth(5);

    this.initializeBubble();

    this.events.on("cameraLeft", () => {
      this._cameraIterator--;
      if (this._cameraIterator < 0) {
        this._cameraIterator = this._playerEntities.size - 1;
      }
      const players = [...this._playerEntities.values()];
      this.cameras.main.startFollow(players[this._cameraIterator]);
    });

    this.events.on("cameraRight", () => {
      this._cameraIterator++;
      if (this._cameraIterator > this._playerEntities.size - 1) {
        this._cameraIterator = 0;
      }
      const players = [...this._playerEntities.values()];
      this.cameras.main.startFollow(players[this._cameraIterator]);
    });
  }

  fixedTick(delta: number) {
    this._clientPlayer.handleInput(this.inputHandler);
    this._playerEntities.forEach((player) => {
      this._playerEntities.forEach((otherPlayer) => {
        if (otherPlayer === player) return;

        if (CollideCircles(player, otherPlayer)) {
          ResolveCircleCollision(player, otherPlayer);
          const i = Math.floor(Math.random() * 8) + 1;
          if (
            player === this._clientPlayer ||
            otherPlayer === this._clientPlayer
          ) {
            this.sound.play("grunt" + i, {
              volume: 0.5,
            });
          }
        }
      });

      this._tiles.forEach((tile) => {
        const [hit, n] = CollideCircleTile(player, tile);
        if (hit) {
          ResolveCircleTileCollision(player, tile, n);
          const i = Math.floor(Math.random() * 8) + 1;
          if (player === this._clientPlayer) {
            this.sound.play("grunt" + i, {
              volume: 0.5,
            });
          }

          return;
        }
      });

      MovePlayer(player, delta, false);
      player.update(0, 0);
    });
    this.inputHandler.sync();
  }

  update(_time: number, dt: number) {
    if (!this._clientPlayer) {
      return;
    }
    this._accumulator += dt;
    while (this._accumulator >= FIXED_TIMESTEP) {
      this._accumulator -= FIXED_TIMESTEP;
      this.fixedTick(FIXED_TIMESTEP);
    }
    for (const [, player] of this._playerEntities) {
      player.draw();
    }
  }

  private initializeBubble() {
    NetworkManager.instance.room.state.bubble.onChange(() => {
      this._bubble.x = NetworkManager.instance.room.state.bubble.x;
      this._bubble.y = NetworkManager.instance.room.state.bubble.y;
      this._bubble.radius = NetworkManager.instance.room.state.bubble.radius;
      this.miniMap.centerOn(this._bubble.x, this._bubble.y);

      const diff = Math.atan2(
        this._bubble.y - this._clientPlayer.y,
        this._bubble.x - this._clientPlayer.x,
      );

      this.events.emit("arrow", diff + Math.PI / 2);
    });
  }

  private colorToNumber(hexStr: string): number {
    const col = Phaser.Display.Color.HexStringToColor(hexStr);
    const red = (col.red << 16) >>> 0;
    const green = (col.green << 8) >>> 0;
    const blue = col.blue >>> 0;

    return red | green | blue;
  }

  private initializePlayerEntities() {
    NetworkManager.instance.room.state.players.onAdd(
      (player: Player, sessionId: string) => {
        player.listen("alive", (alive) => {
          if (!alive) {
            this.events.emit("deathMessage", player.name);
            this._playerEntities.get(sessionId)?.die();
            if (this._clientPlayer === this._playerEntities.get(sessionId)) {
              this.events.emit("playerDead");
            }
          }
        });
        // Initialize client player
        if (sessionId === NetworkManager.instance.room.sessionId) {
          this._playerEntities.set(
            sessionId,
            (this._clientPlayer = new ClientPlayer(
              this,
              player.x,
              player.y,
              player.velocityX,
              player.velocityY,
              this.colorToNumber(player.color),
              player.name,
              player.boost,
              player.boostEngaged,
              player.oxygen,
              player,
            )),
          );
          this.cameras.main.startFollow(
            this._clientPlayer,
            false,
            0.2,
            0.2,
            0,
            0,
          );
          this.cameras.main.zoom = 2;
          this.cameras.main.deadzone = new Phaser.Geom.Rectangle(0, 0, 50, 50);
          this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
          //new PlayerServerReference(this._clientPlayer, player);
        } else {
          //Initialize other player entities
          this._playerEntities.set(
            sessionId,
            new PlayerPrefab(
              this,
              player.x,
              player.y,
              player.velocityX,
              player.velocityY,
              this.colorToNumber(player.color),
              player.name,
              player.boost,
              player.boostEngaged,
              player.oxygen,
              player,
            ),
          );
        }
      },
    );

    NetworkManager.instance.room.state.players.onRemove((_player, key) => {
      this._playerEntities.delete(key);
    });

  }

  private initializeCollectibles() {
    NetworkManager.instance.room.state.collectible.onAdd(
      (circle: CircleEntity, key) => {
        const collectible = this.add.sprite(circle.x, circle.y, "collectible");
        // collectible.setOrigin(0, 0);
        this._collectibles[key] = collectible;
      },
    );
    NetworkManager.instance.room.state.collectible.onRemove((circle, key) => {
      this._collectibles[key].destroy();
      delete this._collectibles[key];
      this.shardEmitter.emitParticleAt(circle.x, circle.y, 8);
      const i = Math.floor(Math.random() * 2) + 1;
      this.sound.play("collect" + i, {
        volume: 0.8,
      });
    });
  }

  private initalizeTiles() {
    NetworkManager.instance.room.state.tiles.onAdd((tile: Tile) => {
      const newTile = this.add.sprite(tile.x, tile.y, "tile");
      newTile.setOrigin(0, 0);
      this._tiles.push(newTile);
    });
  }
}
