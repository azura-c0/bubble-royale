import { NetworkManager } from "../utils/NetworkManager";

export class Lobby extends Phaser.Scene {
  constructor() {
    super("Lobby");
  }

  async create() {
    this.add.text(100, 100, "Lobby", { color: "white" });
    const nm = NetworkManager.getInstance();

    nm.initialize();
    await nm.connectToRoom("hamster");

    nm.room.state.listen("gameStarted", (started) => {
      if (started) {
        this.scene.start("Game");
      }
    });

    nm.room.onMessage("host", (isHost) => {
      if (isHost) {
        this.add.text(this.scene, 200, "Start Game", { color: "white", fontSize: "24px" })
          .setInteractive()
          .on("pointerdown", () => {
            nm.room.send("start");
          })
      }
    });


  }
}
