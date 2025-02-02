import { Scene } from "phaser";
import { NetworkManager } from "../utils/NetworkManager";
import { InputHandler } from "../utils/InputHandler";
import { ClientPlayer, PlayerPrefab } from "../objects/PlayerPrefab";
import { Player } from "../schema/Player";
import { CollideCircles, CollideCircleTile, ResolveCircleCollision, ResolveCircleTileCollision } from "../../../util/Collision";
import { Tile } from "../schema/Tile";
import { MovePlayer } from "../../../util/Player";
import { MAX_BUBBLE_RADIUS, WORLD_HEIGHT, WORLD_WIDTH } from "../../../util/Constants";

const FIXED_TIMESTEP = 1000 / 60;
export class Game extends Scene {
  private _accumulator = 0;

  private _clientPlayer: ClientPlayer;
  private _inputHandler: InputHandler;
  private _tiles: Phaser.GameObjects.Sprite[] = [];
  private _playerEntities: Map<string, PlayerPrefab> = new Map<
    string,
    PlayerPrefab
    >();
  private miniMap: Phaser.Cameras.Scene2D.Camera;
  private _bubble: Phaser.GameObjects.Arc;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("astronaut", "astronaut.png")
    this.load.image("tile", "tile.png")
    this.load.image("smoke", "smoke.png");
    this.load.image("arrow", "arrow.png")
  }

  async create() {
    this.cameras.main.roundPixels = false;
    NetworkManager.getInstance().initialize();
    await NetworkManager.getInstance().connectToRoom("hamster_cheekz");

    this._inputHandler = new InputHandler(this, {
      up: ["W", Phaser.Input.Keyboard.KeyCodes.UP],
      down: ["S", Phaser.Input.Keyboard.KeyCodes.DOWN],
      left: ["A", Phaser.Input.Keyboard.KeyCodes.LEFT],
      right: ["D", Phaser.Input.Keyboard.KeyCodes.RIGHT],
      action: [Phaser.Input.Keyboard.KeyCodes.SPACE],
    });
    const bg = this.add.tileSprite(0, 0, WORLD_WIDTH * 2, WORLD_HEIGHT * 2, "background");
    this.miniMap = this.cameras.add(16, 16, 200, 200).setZoom(0.1).setName('mini');
    this.miniMap.ignore(bg);
    this.miniMap.backgroundColor = Phaser.Display.Color.HexStringToColor("#111");
    //bg.setScale(3, 3);
    this._inputHandler.startListening();
    this.initializePlayerEntities();
    this.initalizeTiles();
    this._bubble = this.add.arc(0, 0, MAX_BUBBLE_RADIUS, 0, 360, false, 0x0000ff, 0.2);
    this.miniMap.centerOn(this._bubble.x, this._bubble.y);

    this.initializeBubble();
  }

  fixedTick(delta: number) {
    this._clientPlayer.handleInput(this._inputHandler);
    this._playerEntities.forEach((player) => {
      this._playerEntities.forEach((otherPlayer) => {
        if (otherPlayer === player) return;

        if (CollideCircles(player, otherPlayer)) {
          ResolveCircleCollision(player, otherPlayer);
        }
      });

      this._tiles.forEach((tile) => {
        const [hit, n] = CollideCircleTile(player, tile);
        if (hit) {
          ResolveCircleTileCollision(player, tile, n);
          return;
        }
      })

      MovePlayer(player, delta, false);
      player.update(0, 0);
    });
    this._inputHandler.sync();
  }

  update(time: number, dt: number) {
    if (!this._clientPlayer) {
      return;
    }
    this._accumulator += dt;
    while (this._accumulator >= FIXED_TIMESTEP) {
      this._accumulator -= FIXED_TIMESTEP;
      this.fixedTick(FIXED_TIMESTEP);
    }
  }


  private handlePlayerCollisions() {
    for (const player of this._playerEntities.values().filter(p => p !== this._clientPlayer)) {
      if (CollideCircles(this._clientPlayer, player)) {
        ResolveCircleCollision(this._clientPlayer, player)
      }
    }
  }

  private initializeBubble() {
    NetworkManager.getInstance().room.state.bubble.onChange(() => {
      this._bubble.x = NetworkManager.getInstance().room.state.bubble.x;
      this._bubble.y =  NetworkManager.getInstance().room.state.bubble.y;
      this._bubble.radius =  NetworkManager.getInstance().room.state.bubble.radius;
      this.miniMap.centerOn(this._bubble.x, this._bubble.y);

      const diff = Math.atan2(this._bubble.y - this._clientPlayer.y, this._bubble.x - this._clientPlayer.x);

      this.events.emit('arrow', diff + Math.PI/2);
    });
  }

  private initializePlayerEntities() {
    NetworkManager.getInstance().room.state.players.onAdd(
      (player: Player, sessionId: string) => {
        // Initialize client player
        if (sessionId === NetworkManager.getInstance().room.sessionId) {
          
          this._playerEntities.set(
            sessionId,
            this._clientPlayer = new ClientPlayer(
              this,
              player.x,
              player.y,
              player.velocityX, player.velocityY,
              0x0000ff,
              player.name,
              player,
            )
          );
          this.cameras.main.startFollow(this._clientPlayer, false, 0.2, 0.2, 0, 0);
          this.cameras.main.zoom = 2;
          this.cameras.main.deadzone = new Phaser.Geom.Rectangle(
            0, 0, 50, 50
          );
          this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
          //new PlayerServerReference(this._clientPlayer, player);
        } else {
          //Initialize other player entities
          this._playerEntities.set(
            sessionId,
            new PlayerPrefab(this, player.x, player.y, player.velocityX, player.velocityY, 0x00ff00, player.name, player),
          );
        }
      },
    );
  }

  private initalizeTiles() {
    NetworkManager.getInstance().room.state.tiles.onAdd(
      (tile: Tile) => {
        const newTile = this.add.sprite(tile.x, tile.y, "tile")
        newTile.setOrigin(0, 0);
        this._tiles.push(newTile);
        console.log(`new tile at ${tile.x}, ${tile.y}`)
        console.log(this._tiles.length);
      },
    );
  }
}
