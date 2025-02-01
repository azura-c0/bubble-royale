import { Scene } from "phaser";
import { NetworkManager } from "../utils/NetworkManager";
import { InputHandler } from "../utils/InputHandler";
import { PlayerPrefab, PlayerServerReference } from "../objects/PlayerPrefab";
import { Player } from "../schema/Player";
import { Collision } from "matter";

export class Game extends Scene {
  private _clientPlayer: PlayerPrefab;
  private _inputHandler: InputHandler;
  private _playerEntities: Map<string, PlayerPrefab> = new Map<
    string,
    PlayerPrefab
  >();

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("background", "bg.png");
    this.load.image("logo", "logo.png");
  }

  async create() {
    NetworkManager.getInstance().initialize();
    await NetworkManager.getInstance().connectToRoom();

    this._inputHandler = new InputHandler(this, {
      up: ["W", Phaser.Input.Keyboard.KeyCodes.UP],
      down: ["S", Phaser.Input.Keyboard.KeyCodes.DOWN],
      left: ["A", Phaser.Input.Keyboard.KeyCodes.LEFT],
      right: ["D", Phaser.Input.Keyboard.KeyCodes.RIGHT],
      action: [Phaser.Input.Keyboard.KeyCodes.SPACE],
    });

    this._inputHandler.startListening();
    this.initializePlayerEntities();
  }

  update() {
    this.handlePlayerEntityMovement();
    this.handleClientPlayerMovement();
  }

  private handleClientPlayerMovement() {
    if (this._inputHandler == null) return;

    if (this._inputHandler.input["up"]) {
      this._clientPlayer.y -= 2;
    } else if (this._inputHandler.input["down"]) {
      this._clientPlayer.y += 2;
    }

    if (this._inputHandler.input["left"]) {
      this._clientPlayer.x -= 2;
    } else if (this._inputHandler.input["right"]) {
      this._clientPlayer.x += 2;
    }
  }

  private handlePlayerEntityMovement() {
    for (const [sessionId, entity] of this._playerEntities) {
      if (sessionId === NetworkManager.getInstance().room.sessionId) continue;
      const serverState: Player = entity.getData("state");
      entity.x = Phaser.Math.Linear(entity.x, serverState.x, 0.2);
      entity.y = Phaser.Math.Linear(entity.y, serverState.y, 0.2);
    }
  }

  private initializePlayerEntities() {
    NetworkManager.getInstance().room.state.players.onAdd(
      (player: Player, sessionId: string) => {
        // Initialize client player
        if (sessionId === NetworkManager.getInstance().room.sessionId) {
          console.log("Player added", player);

          this._clientPlayer = new PlayerPrefab(
            this,
            player.x,
            player.y,
            "ship",
            player,
          );

          new PlayerServerReference(this._clientPlayer, player);
        } else {
          //Initialize other player entities
          this._playerEntities.set(
            sessionId,
            new PlayerPrefab(this, player.x, player.y, "ship", player),
          );
        }
      },
    );
  }
}
