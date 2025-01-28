import { Player } from "../schema/Player";

export class PlayerPrefab extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    state: Player,
  ) {
    super(scene, x, y, texture);
    this.scene = scene;
    this.scene.add.existing(this);
    this.setScale(2);
    this.initializePlayer(state);
  }

  private initializePlayer(player: Player) {
    player.onChange(() => {
      this.setData<Player>("state", player);
    });
  }
}

export class PlayerServerReference extends PlayerPrefab {
  constructor(playerPrefab: PlayerPrefab, serverState: Player) {
    super(
      playerPrefab.scene,
      playerPrefab.x,
      playerPrefab.y,
      playerPrefab.texture,
      serverState,
    );

    this.setAlpha(0.25);
    serverState.onChange(() => {
      this.setPosition(serverState.x, serverState.y);
    });
  }
}
