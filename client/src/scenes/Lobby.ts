import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../util/Constants";
import { NetworkManager } from "../utils/NetworkManager";
import { IPlayerData } from "../../../util/types";

export class Lobby extends Phaser.Scene {
  private _nameListOffset = 0;

  constructor() {
    super("Lobby");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("lobbybg", "lobbybg.png");
    this.load.spritesheet("startbutton", "startbutton.png", {
      frameWidth: 64,
      frameHeight: 32,
      startFrame: 0,
      endFrame: 1,
    });
  }

  async create(data: IPlayerData) {
    const nm = NetworkManager.getInstance();

    nm.initialize();
    await nm.connectToRoom(data.name, data.color);

    nm.room.state.listen("gameStarted", (started) => {
      if (started) {
        this.scene.start("Game");
        this.scene.launch("UIScene");
      }
    });

    nm.room.state.players.onAdd((player) => {
      this._nameListOffset += 20;
      this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + this._nameListOffset, player.name)
    });

    nm.room.onMessage("host", (isHost) => {
      if (isHost) {
        const button = this.add
          .sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "startbutton", 0)
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
        // this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "Start Game", { color: "white", fontSize: "24px" })
        //   .setInteractive()
        //   .on("pointerdown", () => {
        //     nm.room.send("start");
        //   })
      }
    });
  }
}
