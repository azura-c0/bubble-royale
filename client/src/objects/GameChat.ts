import { Game } from "../scenes/Game";
import { SCREEN_WIDTH } from "../../../util/Constants";
import { inputStyle } from "../components/styles";
import { NetworkManager } from "../utils/NetworkManager";

export class GameChat extends Phaser.GameObjects.DOMElement {
  private readonly _chatStyle = `
    background-color: rgba(0, 0, 0, 0.25);
    position: absolute;
    left: 400px;
    top: 15px;
    width: 600px;
    height: 200px;
    color: #fff;
    padding: 35px 5px;
    border-radius: 15px;
    font-family: "ProggyClean";
    font-size: 24px;
  `;
  private _inputOpen: boolean = false;

  constructor(scene: Game) {
    super(scene, SCREEN_WIDTH, 0);

    this.createFromHTML(`
    <div id="chat" style="${this._chatStyle}">
      <div id="messages" style="display: flex; flex-direction: column; justify-content: start; align-items: start; width: 99%; height: 95%; overflow-y: scroll; scrollbar-color: #0d0d0f #28282B; font-size: 28px;"></div>
      <input type="text" id="input-box" style="${inputStyle} display: flex; border-radius: 15px; position: absolute; top: 85%; left: 2%; width: 85%; height: 15px; font-size: 24px;" placeholder="Press enter to chat..."/>
    </div>
    `);

    const inputBox: HTMLInputElement = document.getElementById(
      "input-box",
    ) as HTMLInputElement;

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && !this._inputOpen) {
        this._inputOpen = true;
        inputBox!.focus();
        inputBox!.placeholder = "";
        scene.input.keyboard?.disableGlobalCapture();
      } else if (e.key === "Enter" && this._inputOpen) {
        this._inputOpen = false;
        inputBox!.blur();
        inputBox!.placeholder = "Press enter to chat...";
        const message = inputBox!.value;
        inputBox!.value = "";
        NetworkManager.instance.room.send("message", message);
        scene.input.keyboard?.enableGlobalCapture();
      }

      if (e.key === "Escape" && this._inputOpen) {
        this._inputOpen = false;
        inputBox!.blur();
        inputBox!.placeholder = "Press enter to chat...";
        inputBox!.value = "";
        scene.input.keyboard?.enableGlobalCapture();
      }
    });

  }

}
