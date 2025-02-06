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

export class Button extends Phaser.GameObjects.DOMElement {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    super(scene, x, y, "button", buttonStyle);
    this.setText(text);
    this.setInteractive();
    this.addListener("click");
    this.on("click", onClick);
    scene.add.existing(this);
  }
}
