import { Player } from "../schema/Player";
import { PLAYER_RADIUS } from '../../../util/Constants';
import { MovePlayer } from '../../../util/Player';

export class PlayerPrefab extends Phaser.GameObjects.Arc {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public velocityX: number,
    public velocityY: number,
    public color: number,
    state?: Player,
  ) {
    super(scene, x, y, PLAYER_RADIUS, 0, 360, false, color);
    this.scene = scene;
    this.scene.add.existing(this);
    this.setScale(2);
    if (state) {
      this.initializePlayer(state);
    }
  }

  private initializePlayer(player: Player) {
    player.onChange(() => {
      this.setData<Player>("state", player);
    });
  }

  public override update() {
    MovePlayer(this);
  }
}

export class PlayerServerReference extends PlayerPrefab {
  constructor(playerPrefab: PlayerPrefab, serverState: Player) {
    super(
      playerPrefab.scene,
      playerPrefab.x,
      playerPrefab.y,
      playerPrefab.velocityX,
      playerPrefab.velocityY,
      playerPrefab.color,
      serverState
    );

    this.setAlpha(0.25);
    serverState.onChange(() => {
      this.setPosition(serverState.x, serverState.y);
    });
  }
}
