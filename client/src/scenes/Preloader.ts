import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() 
  {
    super("Preloader");
  }

  preload() 
  {
    this.load.setPath("assets");
    this.load.image("background", "rocks.png");
    this.load.image("logo", "logo.png");
    this.load.image("ship", "ship.png");
  }

  create() 
  {
    this.scene.start("Lobby");
  }
}
