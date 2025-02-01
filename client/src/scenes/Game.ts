import { Scene } from "phaser";
import { NetworkManager } from "../utils/NetworkManager";
import { InputHandler } from "../utils/InputHandler";
import { ClientPlayer, PlayerPrefab, PlayerServerReference } from "../objects/PlayerPrefab";
import { Player } from "../schema/Player";
import { PLAYER_ACCELERATION } from "../../../util/Constants";
import { CollideCircles, ResolveCircleCollision } from "../../../util/Collision";
import { Tile } from "../schema/Tile";

export class Game extends Scene {
  private _clientPlayer: ClientPlayer;
  private _inputHandler: InputHandler;
  private _tiles: Phaser.GameObjects.Rectangle[] = [];
  private _playerEntities: Map<string, PlayerPrefab> = new Map<
    string,
    PlayerPrefab
  >();

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
  }

  async create() {
    this.cameras.main
    NetworkManager.getInstance().initialize();
    await NetworkManager.getInstance().connectToRoom();

    this._inputHandler = new InputHandler(this, {
      up: ["W", Phaser.Input.Keyboard.KeyCodes.UP],
      down: ["S", Phaser.Input.Keyboard.KeyCodes.DOWN],
      left: ["A", Phaser.Input.Keyboard.KeyCodes.LEFT],
      right: ["D", Phaser.Input.Keyboard.KeyCodes.RIGHT],
      action: [Phaser.Input.Keyboard.KeyCodes.SPACE],
    });
    const bg = this.add.image(0, 0, "background");
    //bg.setScale(3, 3);
    this._inputHandler.startListening();
    this.initializePlayerEntities();
    this.initalizeTiles();
  }

  update() {
    for (const player of this._playerEntities.values()) {
      player.update();
    }
    this._clientPlayer?.handleInput(this._inputHandler);
    this._clientPlayer?.updateCamera(this.cameras.main);
    this.handlePlayerCollisions();
  }


  private handlePlayerCollisions() {
    for (const player of this._playerEntities.values().filter(p => p !== this._clientPlayer)) {
      if (CollideCircles(this._clientPlayer, player)) {
        ResolveCircleCollision(this._clientPlayer, player)
      }
    }
  }

  private initializePlayerEntities() {
    NetworkManager.getInstance().room.state.players.onAdd(
      (player: Player, sessionId: string) => {
        // Initialize client player
        if (sessionId === NetworkManager.getInstance().room.sessionId) {
          console.log("Player added", player);

          this._playerEntities.set(
            sessionId,
            this._clientPlayer = new ClientPlayer(
              this,
              player.x,
              player.y,
              0, 0,
              0xff0000,
              player,
            )
          );

          //new PlayerServerReference(this._clientPlayer, player);
        } else {
          //Initialize other player entities
          this._playerEntities.set(
            sessionId,
            new PlayerPrefab(this, 100, 32, 0, 0, 0x00ff00, player),
          );
        }
      },
    );
  }

  private initalizeTiles() {
    NetworkManager.getInstance().room.state.tiles.onAdd(
      (tile: Tile) => { 
        const newTile = this.add.rectangle(tile.x, tile.y, tile.width, tile.height, 0x00000)
        this._tiles.push(newTile);
        console.log(`new tile at ${tile.x}, ${tile.y}`)
        console.log(this._tiles.length);
      },
    );
  }
}
