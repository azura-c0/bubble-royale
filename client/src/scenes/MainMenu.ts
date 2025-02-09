import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../util/Constants";
import { NetworkManager } from "../utils/NetworkManager";
import { Button } from "../components/button";
import { inputStyle } from "../components/styles";

export class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
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

  create() {
    const bg = this.add.image(0, 0, "lobbybg");
    bg.setOrigin(0, 0);
    bg.setScale(2);

    const inputDivStyle = `
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 30px;
      `;

    const colorStyle = `
      box-sizing: border-box;
      border: 2px solid white;
      padding: 5px;
      width: 50px;
      height: 50px;
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      background-color: #28282B;
      font-family: 'ProggyClean';
      cursor: pointer;
    `;

    this.add.dom(512, SCREEN_HEIGHT / 2 + 120).createFromHTML(`
          <style>
            #input-div { ${inputDivStyle} }
            #username { ${inputStyle} }
            #color { ${colorStyle} }
            #color-picker { display: flex; align-items: center; gap: 12px; font-size: 29px; font-family: 'ProggyClean'; font-weight: bold; font-color: #28282B}
            button:active { background-color: #767099; }
          </style>
          <div id="input-div">
          <input type="text" id="username" placeholder="Username" required>
          <div id="color-picker">
            <label for="color">Jetpack Color: </label>
            <input type="color" id="color" value="#ff0000">
          </div>
          </div>
          `);

    const joinGameDiv = this.add
      .dom(512, SCREEN_HEIGHT / 2 + 200)
      .createFromHTML(
        `
      <style>
        #join-game-div { ${inputDivStyle}; background-color: #0d0d0f;  border-radius: 35px; width: 600px; height: 300px; }
        input { ${inputStyle} }
        button:active { background-color: #767099; }
      </style>
      <div id="join-game-div">
      <p id="error-message" style="color: red; font-size: 32px; font-weight: bold; font-family: 'ProggyClean'; position: absolute; top: 2px;"></p>
      <input type="text" id="room-id" placeholder="Enter Room Code" required>
      </div>
    `,
      )
      .setVisible(false);

    const findGameButton = new Button(
      this,
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2 + 250,
      "Find Game",
      () => this.handleButtonClick("find"),
    );

    const hostGameButton = new Button(
      this,
      SCREEN_WIDTH / 2 - 175,
      SCREEN_HEIGHT / 2 + 250,
      "Host Game",
      () => this.handleButtonClick("host"),
    );

    const backButton = new Button(
      this,
      SCREEN_WIDTH / 2 - 115,
      SCREEN_HEIGHT / 2 + 275,
      "Back",
      () => {
        hostGameButton.setVisible(true);
        findGameButton.setVisible(true);
        openGameJoinMenuButton.setVisible(true);
        backButton.setVisible(false);
        joinGameDiv.setVisible(false);
        joinGameButton.setVisible(false);
      },
    ).setVisible(false);

    const joinGameButton = new Button(
      this,
      SCREEN_WIDTH / 2 + 75,
      SCREEN_HEIGHT / 2 + 275,
      "Join Game",
      () => this.handleButtonClick("join"),
    ).setVisible(false);

    const openGameJoinMenuButton = new Button(
      this,
      SCREEN_WIDTH / 2 + 175,
      SCREEN_HEIGHT / 2 + 250,
      "Join Game",
      () => {
        const username = document.getElementById(
          "username",
        ) as HTMLInputElement;
        if (username.value === "") {
          username.style.border = "2px solid red";
          return;
        }

        username.style.border = "2px solid white";
        hostGameButton.setVisible(false);
        findGameButton.setVisible(false);
        openGameJoinMenuButton.setVisible(false);
        backButton.setVisible(true);
        joinGameDiv.setVisible(true);
        joinGameButton.setVisible(true);
      },
    );
  }
  async handleButtonClick(action: "host" | "join" | "find") {
    const username = document.getElementById("username") as HTMLInputElement;
    const color = document.getElementById("color") as HTMLInputElement;
    const roomId = document.getElementById("room-id") as HTMLInputElement;

    if (username.value === "") {
      username.style.border = "2px solid red";
      return;
    }
    username.style.border = "2px solid white";
    console.log(roomId.value);

    const nm = NetworkManager.instance;

    nm.initialize();
    const room = await nm.connectToRoom(username.value, color.value, action, roomId.value);

    if (room instanceof Error) {
      document.getElementById("error-message")!.innerText = room.message;
      return;
    }
    console.log(nm.room);
    this.scene.start("Lobby", nm.room);
  }
}
