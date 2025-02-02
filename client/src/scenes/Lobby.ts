import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../util/Constants";
import { NetworkManager } from "../utils/NetworkManager";
import { IPlayerData } from "../../../util/types";

export class Lobby extends Phaser.Scene {
  private _nameListOffset: number = 0;
  private _playerList: Map<string, Phaser.GameObjects.Text> = new Map();
  private _isHost: boolean = false;

  constructor() {
    super("Lobby");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("rockbg", "rockbg.png");
  }

  async create(data: IPlayerData) {
    const bg = this.add.image(0, 0, "rockbg");
    bg.setOrigin(0, 0);
    bg.setScale(1.5);

    const nm = NetworkManager.getInstance();

    nm.initialize();
    await nm.connectToRoom(data.name, data.color);

    nm.room.state.listen("gameStarted", (started) => {
      if (started) {
        this.scene.start("Game");
        this.scene.launch("UIScene");
      }
    });

    this.add.text(20, 50, "Players:", {
      color: "white",
      fontSize: "48px",
      fontStyle: "bold",
      fontFamily: "ProggyClean",
    });

    nm.room.state.players.onAdd((player, sessionId) => {
      this._nameListOffset += 25;
      const playerText = this.add.text(
        20,
        80 + this._nameListOffset,
        player.name,
        {
          color: player.color,
          fontSize: "32px",
          fontStyle: "bold",
          fontFamily: "ProggyClean",
        },
      );
      this._playerList.set(sessionId, playerText);
    });

    nm.room.state.players.onRemove((_player, sessionId) => {
      this._nameListOffset -= 25;
      this._playerList.get(sessionId)?.destroy();
      this._playerList.forEach((text) => {
        text.y -= 25;
      });
    });

    nm.room.onMessage("host", (isHost) => {
      this._isHost = isHost;
      if (this._isHost) {
        this.add.text(
          SCREEN_WIDTH / 2 - 385,
          SCREEN_HEIGHT - 100,
          "You are the host, press start when all players have joined",
          {
            color: "white",
            fontSize: "32px",
            fontStyle: "bold",
            fontFamily: "ProggyClean",
          },
        );
        const button = this.add
          .sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 35, "startbutton", 0)
          .setScale(2)
          .setInteractive()
          .on("pointerdown", () => {
            button.setFrame(1);
          })
          .on("pointerup", () => {
            button.setFrame(0);
            nm.room.send("start");
          })
          .on("click", () => {
            nm.room.send("start");
          });
      }
    });

    if (!this._isHost) {
    }
  }

  update() {
    if (this._isHost) {
      this.add.text(
        SCREEN_WIDTH / 2 - 385,
        SCREEN_HEIGHT - 100,
        "Waiting for host to start the game...",
        {
          color: "white",
          fontSize: "32px",
          fontStyle: "bold",
          fontFamily: "ProggyClean",
        },
      );
    }
  }
}
