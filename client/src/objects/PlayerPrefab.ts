import { Player } from "../schema/Player";
import { PLAYER_ACCELERATION, PLAYER_RADIUS } from '../../../util/Constants';
import { InputHandler } from "../utils/InputHandler";
import { Vec2dLen, Vec2dNormal } from "../../../util/Collision";

export class PlayerPrefab extends Phaser.GameObjects.Sprite {
  public radius: number;
  protected viewDir: [number, number];
  protected arc: Phaser.GameObjects.Arc;
  protected text: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public velocityX: number,
    public velocityY: number,
    public color: number,
    public name: string,
    state?: Player,
  ) {
    super(scene, x, y, "astronaut");
    this.scene = scene;
    this.scene.add.existing(this);
    this.setScale(1);
    this.arc = scene.add.arc(this.x, this.y, PLAYER_RADIUS, 0, 360, false, 0xff0000, 128);
    this.text = scene.add.text(x, y, this.name, {
      color: "red",
      fontSize: 10,
      fontFamily: 'ProggyClean',
      resolution: 8,
      shadow: {
        color: "white",
        blur: 10,
        offsetX: 0,
        offsetY: 0,
        fill: true
      }
    });
    this.text.x = this.x - this.text.width / 2;
    this.text.setDepth(1);
    
    this.radius = PLAYER_RADIUS;
    if (state) {
      this.initializePlayer(state);
    }
  }

  private initializePlayer(player: Player) {
    player.onChange(() => {
      this.setData<Player>("state", player);
    });
  }

  public override update(time: number, dt: number) {
    this.arc.x = this.x;
    this.arc.y = this.y;
    if (this.text) {
      this.text.x = this.x - this.text.width / 2;
      this.text.y = this.y - PLAYER_RADIUS - this.text.height - 5;
    }
    this.sync();
  }

  protected sync() {
    const serverState: Player = this.getData("state");
    this.x = Phaser.Math.Linear(this.x, serverState.x, 0.2);
    this.y = Phaser.Math.Linear(this.y, serverState.y, 0.2);
    this.velocityX = Phaser.Math.Linear(this.velocityX, serverState.velocityX, 0.2);
    this.velocityY = Phaser.Math.Linear(this.velocityY, serverState.velocityY, 0.2);
  }
}

export class ClientPlayer extends PlayerPrefab {
  private cameraPoint: { x: number, y: number }
  protected viewDirTarget: [number, number]

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    color: number,
    name: string,
    state?: Player,
  ) {
    super(scene, x, y, velocityX, velocityY, color, name, state);
    this.cameraPoint = {
      x,
      y
    };
    this.viewDir = [0, -1];
    this.viewDirTarget = [0, -1];
  }

  public handleInput(input: InputHandler) {
    if (input.input["up"]) {
      this.velocityY -= PLAYER_ACCELERATION;
      this.viewDirTarget[1] = -1;
    } else if (input.input["down"]) {
      this.velocityY += PLAYER_ACCELERATION;
      this.viewDirTarget[1] = 1;
    }

    if (input.input["left"]) {
      this.velocityX -= PLAYER_ACCELERATION;
      this.viewDirTarget[0] = -1;
    } else if (input.input["right"]) {
      this.velocityX += PLAYER_ACCELERATION;
      this.viewDirTarget[0] = 1;
    }

    this.viewDirTarget = Vec2dNormal(this.viewDirTarget);
    const viewDirTargetAngle = Math.atan2(this.viewDirTarget[0], -this.viewDirTarget[1]);
    this.rotation = Phaser.Math.Linear(this.rotation, viewDirTargetAngle, 0.2);
  }

  protected override sync() {
    super.sync();
  }

  public updateCamera(camera: Phaser.Cameras.Scene2D.Camera) {
    camera.zoom = 3;
    const speed = Vec2dLen([this.velocityX, this.velocityY]);
    const dir = speed === 0 ? [0, 0] : Vec2dNormal([this.velocityX, this.velocityY]);

    this.cameraPoint.x = this.x + dir[0] * speed * 10;
    this.cameraPoint.y = this.y + dir[1] * speed * 10;

    camera.centerOn(this.x, this.y);
  }
}

export class PlayerServerReference extends PlayerPrefab {
  constructor(
    public playerPrefab: PlayerPrefab,
    serverState: Player
  ) {
    super(
      playerPrefab.scene,
      playerPrefab.x,
      playerPrefab.y,
      playerPrefab.velocityX,
      playerPrefab.velocityY,
      playerPrefab.color,
      serverState.name,
      serverState
    );

    this.setAlpha(0.25);
    serverState.onChange(() => {
      this.playerPrefab.setData("state", serverState);
      this.setPosition(serverState.x, serverState.y);
    });
  }
}
