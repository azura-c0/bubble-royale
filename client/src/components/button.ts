export class Button extends Phaser.GameObjects.DOMElement {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    // Enhanced button style with hover/active states and animations
    const buttonStyle = `
      padding: 12px 20px;
      font-size: 32px;
      font-weight: bold;
      color: #28282B;
      border-radius: 10px;
      background: linear-gradient(to bottom, #c5bff0 0%, #b1a9e4 100%);
      font-family: 'ProggyClean', monospace;
      cursor: pointer;
      border: 2px solid #9f96db;
      box-shadow: 0 4px 0 #8a7ad8, 0 5px 10px rgba(0, 0, 0, 0.2);
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
      transition: all 0.1s ease-out;
      user-select: none;
      position: relative;
      overflow: hidden;
      text-align: center;
      min-width: 180px;
    }
    
    button:hover {
      background: linear-gradient(to bottom, #d0cbf7 0%, #c5bff0 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #8a7ad8, 0 8px 15px rgba(0, 0, 0, 0.3);
    }
    
    button:active {
      transform: translateY(2px);
      box-shadow: 0 1px 0 #8a7ad8, 0 2px 5px rgba(0, 0, 0, 0.2);
      background: linear-gradient(to bottom, #a59cdb 0%, #b1a9e4 100%);
    }
    
    button::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      transform: skewX(-25deg);
      transition: all 0.75s ease;
    }
    
    button:hover::after {
      left: 100%;
    }
    `

    super(scene, x, y, "button", buttonStyle)
    this.setText(text)
    this.setInteractive()
    this.addListener("click")
    this.on("click", () => {
      // Add a small scale animation on click
      this.scene.tweens.add({
        targets: this.node,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        ease: "Power1",
      })

      // Call the provided onClick handler
      onClick()
    })

    // Add sound effect if available
    this.on("pointerover", () => {
      if (scene.sound && scene.sound.get("hover")) {
        scene.sound.play("hover", { volume: 0.3 })
      }
    })

    this.on("pointerdown", () => {
      if (scene.sound && scene.sound.get("click")) {
        scene.sound.play("click", { volume: 0.5 })
      }
    })

    scene.add.existing(this)
  }

  // Add method to disable/enable the button
  setEnabled(enabled: boolean): this {
    if (!enabled) {
      this.node.style.opacity = "0.6"
      this.node.style.cursor = "default"
      this.node.style.boxShadow = "0 2px 0 #9e9e9e, 0 3px 5px rgba(0, 0, 0, 0.1)"
      this.node.style.background = "linear-gradient(to bottom, #c5c5c5 0%, #b1b1b1 100%)"
      this.node.style.borderColor = "#9e9e9e"
      this.disableInteractive()
    } else {
      this.node.style.opacity = "1"
      this.node.style.cursor = "pointer"
      this.node.style.boxShadow = "0 4px 0 #8a7ad8, 0 5px 10px rgba(0, 0, 0, 0.2)"
      this.node.style.background = "linear-gradient(to bottom, #c5bff0 0%, #b1a9e4 100%)"
      this.node.style.borderColor = "#9f96db"
      this.setInteractive()
    }
    return this
  }

  // Add method to make the button pulse to draw attention
  pulse(): this {
    this.scene.tweens.add({
      targets: this.node,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: 1,
      ease: "Sine.easeInOut",
    })
    return this
  }
}

