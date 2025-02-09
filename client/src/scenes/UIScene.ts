import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../util/Constants";
import { NetworkManager } from "../utils/NetworkManager";

export class UIScene extends Phaser.Scene {
  private arrow: Phaser.GameObjects.Image;
  private bar: Phaser.GameObjects.Image;
  private meter: Phaser.GameObjects.Image;
  private eliminated?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "UIScene", active: false });
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("arrow", "arrow.png");
    this.load.image("mapBorder", "mapBorder.png");
    this.load.image("boostbar", "boostbar.png");
    this.load.image("boostmeter", "boostmeter.png");
    this.load.spritesheet("leftbutton", "leftbutton.png", {
      frameWidth: 24,
      frameHeight: 24,
      startFrame: 0,
      endFrame: 1,
    });
    this.load.spritesheet("rightbutton", "rightbutton.png", {
      frameWidth: 24,
      frameHeight: 24,
      startFrame: 0,
      endFrame: 1,
    });
  }

  create() {
    this.add.image(116, 116, "mapBorder");
    this.bar = this.add.image(4 + 128, SCREEN_HEIGHT - 38, "boostbar");
    this.bar.setScale(2);

    this.meter = this.add.image(4 + 128, SCREEN_HEIGHT - 38, "boostmeter");
    this.meter.setScale(2);

    this.arrow = this.add.image(this.sys.game.canvas.width / 2, 70, "arrow");
    this.arrow.scale = 2.5;

    const game = this.scene.get("Game");

    game.events.on("arrow", (rotation: number) => {
      this.arrow.rotation = rotation;
    });

    game.events.on("boost", (boost: number) => {
      this.meter.setCrop(
        0,
        0,
        this.meter.width * (boost / 300),
        this.meter.height,
      );
    });

    game.events.on("playerDead", () => {
      const left = this.add
        .sprite(SCREEN_WIDTH / 2 - 64, SCREEN_HEIGHT - 32, "leftbutton", 0)
        .setScale(2)
        .setInteractive()
        .on("pointerdown", () => {
          left.setFrame(1);
        })
        .on("pointerup", () => {
          left.setFrame(0);
          game.events.emit("cameraLeft");
        });

      const right = this.add
        .sprite(SCREEN_WIDTH / 2 + 64, SCREEN_HEIGHT - 32, "rightbutton", 0)
        .setScale(2)
        .setInteractive()
        .on("pointerdown", () => {
          right.setFrame(1);
        })
        .on("pointerup", () => {
          right.setFrame(0);
          game.events.emit("cameraRight");
        });

      this.createMenuButton();
   });

    const deathMessages = [
      "was eliminated",
      "exploded",
      "died in the vacuum of space",
      "wasn't fast enough",
      "kicked the bucket",
      "was gibbed",
      "met their maker",
      "went to live on a farm with other doggies",
      "was sent to the shadow realm",
      "went out for milk and cigarettes",
      "is in a worse place now",
    ];

    game.events.on("deathMessage", (name: string) => {
      const message = Math.floor(Math.random() * deathMessages.length);

      if (this.eliminated) {
        this.eliminated.destroy();
        this.eliminated = undefined;
      }

      this.eliminated = this.add.text(
        SCREEN_WIDTH - 32,
        SCREEN_HEIGHT - 84,
        name + " " + deathMessages[message],
        {
          color: "#ffffff",
          fontFamily: "ProggyClean",
          fontSize: 32,
          shadow: {
            blur: 2,
            fill: true,
            color: "black",
          },
          stroke: "black",
          strokeThickness: 4,
        },
      );
      this.eliminated.setOrigin(1, 0.5);

      setTimeout(() => {
        if (this.eliminated) {
          this.eliminated.destroy();
          this.eliminated = undefined;
        }
      }, 5000);
    });

    NetworkManager.instance.room.onMessage("win", (name: string) => {
      this.add
        .text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, `${name} wins!`, {
          fontSize: "68px",
          color: "#ffffff",
          fontFamily: "ProggyClean",
        })
        .setOrigin(0.5, 0.5);

      this.createMenuButton();
    });
  }

  createMenuButton() {
      const label = this.add
        .text(
          SCREEN_WIDTH / 2,
          SCREEN_HEIGHT / 2 + 100,
          "Return to main menu",
          {
            fontSize: "32px",
            color: "#ffffff",
            fontFamily: "ProggyClean",
          },
        )
        .setOrigin(0.5, 0.5)
        .setDepth(1);

      const button = this.add
        .rectangle(
          SCREEN_WIDTH / 2,
          SCREEN_HEIGHT / 2 + 100,
          300,
          50,
          0x000000,
          0.8,
        )
        .setInteractive()
        .on("pointerover", () => {
          button.setFillStyle(0x000000, 0.8);
          label.setStyle({
            color: "#DA70D6",
          });
        })
        .on("pointerout", () => {
          button.setFillStyle(0x000000, 0.5);
          label.setStyle({
            color: "#ffffff",
          });
        })
        .on("pointerdown", () => {
          button.setFillStyle(0x000000, 0.5);
        })
        .on("pointerup", () => {
          button.setFillStyle(0x000000, 0.8);
          window.location.reload();
        });
  }
}
