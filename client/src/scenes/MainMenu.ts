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

    const formStyle = `
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 20px;
      `;

    const inputStyle = `
      padding: 5px;
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      background-color: #28282B;
      font-family: 'ProggyClean';
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
    const buttonStyle = `
      padding: 8px;
      font-size: 32px;
      font-weight: bold;
      color: #28282B;
      border-radius: 10px;
      background-color: #b1a9e4;
      font-family: 'ProggyClean';
      cursor: pointer;
    `;
    const form: Phaser.GameObjects.DOMElement = this.add.dom(512, 384)
      .createFromHTML(`
          <style>
            form { ${formStyle} }
            #username { ${inputStyle} }
            #color { ${colorStyle} }
            button { ${buttonStyle} }
            button:active { background-color: #767099; }
          </style>
          <form id="form">
          <input type="text" id="username" placeholder="Username" required>
          <input type="color" id="color" value="#ff0000">
          <button type="submit">Find Game</button>
          </form>
          `);

    form.addListener("submit");
    form.on("submit", (e: Event) => {
      e.preventDefault();
      const username = (document.getElementById("username") as HTMLInputElement)
        .value;
      const color = (document.getElementById("color") as HTMLInputElement)
        .value;
      console.log(username, color);
      this.scene.start("Lobby", { name: username, color });
    });
  }
}
