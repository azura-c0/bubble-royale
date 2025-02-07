import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../util/Constants";
import { Room } from "colyseus.js";
import { MyRoomState } from "../schema/MyRoomState";

export class Lobby extends Phaser.Scene {
  private _nameListOffset: number = 0;
  private _playerList: Map<string, Phaser.GameObjects.Text> = new Map();
  private _isHost: boolean = false;
  private _waitingText: Phaser.GameObjects.Text;

  constructor() {
    super("Lobby");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("rockbg", "rockbg.png");
  }

  async create(room: Room<MyRoomState>) {
    const bg = this.add.image(0, 0, "rockbg");
    bg.setOrigin(0, 0);
    bg.setScale(1.5);

    room.state.listen("gameStarted", (started) => {
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

    const playerCount = this.add.text(SCREEN_WIDTH / 2, 60, `${this._playerList.size}/30`, {
      color: "white",
      fontSize: "52px",
      fontStyle: "bold",
      fontFamily: "ProggyClean",
    }).setOrigin(0.5, 0);

    this.add
      .text(
        SCREEN_WIDTH - 110,
        50,
        `Room code
${room.id}
      `,
        {
          color: "white",
          fontSize: "42px",
          fontStyle: "bold",
          fontFamily: "ProggyClean",
        },
      )
      .setOrigin(0.5, 0);

    room.state.players.onAdd((player, sessionId) => {
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
      playerCount.setText(`${this._playerList.size}/30`);
    });

    room.state.players.onRemove((_player, sessionId) => {
      if (!this._playerList.has(sessionId)) return;

      this._nameListOffset -= 25;
      this._playerList.forEach((text) => {
        if (text.y > this._playerList.get(sessionId)!.y) text.y -= 25;
      });
      this._playerList.get(sessionId)?.destroy();
    });

    room.onMessage("host", (isHost) => {
      this._isHost = isHost;
      if (this._isHost) {
        this.add.text(
          SCREEN_WIDTH / 2 - 385,
          SCREEN_HEIGHT - 150,
          "You are the host, press start when all players have joined",
          {
            color: "white",
            fontSize: "32px",
            fontStyle: "bold",
            fontFamily: "ProggyClean",
          },
        );
        const button = this.add
          .sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 65, "startbutton", 0)
          .setScale(2)
          .setInteractive()
          .on("pointerdown", () => {
            button.setFrame(1);
          })
          .on("pointerup", () => {
            button.setFrame(0);
            room.send("start");
          })
          .on("click", () => {
            room.send("start");
          });
      }
    });

    room.send("amIHost"); // Ask the server if we are the host

    this._waitingText = this.add
      .text(
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT - 100,
        "Waiting for host to start the game...",
        {
          color: "white",
          fontSize: "32px",
          fontStyle: "bold",
          fontFamily: "ProggyClean",
        },
      )
      .setOrigin(0.5, 0.5);
  }

  update() {
    if (this._isHost) {
      this._waitingText.setAlpha(0);
    }
  }
}
