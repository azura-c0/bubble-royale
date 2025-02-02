import { Player } from "../schema/Player";
import { PLAYER_ACCELERATION, PLAYER_RADIUS } from '../../../util/Constants';
import { InputHandler } from "../utils/InputHandler";
import { lerpAngle, Vec2dLen, Vec2dNormal } from "../../../util/Collision";

export class PlayerPrefab extends Phaser.GameObjects.Sprite {
  public radius: number;
  protected viewDir: [number, number];
  protected text: Phaser.GameObjects.Text;
  protected jetpack: Phaser.GameObjects.Particles.ParticleEmitter;
  protected boostjetpack: Phaser.GameObjects.Particles.ParticleEmitter;
  protected blood: Phaser.GameObjects.Particles.ParticleEmitter;

  private emitterCounter = 0;
  protected playerColor: Phaser.GameObjects.Rectangle;


  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public velocityX: number,
    public velocityY: number,
    public color: number,
    public name: string,
    public boost: number,
    public boostActive: boolean,
    public oxygen: number,
    state?: Player,
  ) {
    super(scene, x, y, "astronaut");
    this.scene = scene;
    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.25);
    // this.arc = scene.add.arc(this.x, this.y, PLAYER_RADIUS, 0, 360, false, 0xff0000, 128);
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
    this.text.setDepth(3);
    this.playerColor = this.scene.add.rectangle(this.x, this.y, 22, 8, this.color);
    this.playerColor.setDepth(1);
    this.playerColor.setOrigin(0.5, -1.75);
    this.setDepth(2);
    this.jetpack = this.scene.add.particles(0, 0, "smoke", {
      lifespan: 1000,
      emitting: false,
      frequency: 100000,
      scale: { start: 1.0, end: 0 },
      rotate: { start: 0, end: 180 }
    });
    this.boostjetpack = this.scene.add.particles(0, 0, "boostSmoke", {
      lifespan: 1000,
      emitting: false,
      frequency: 100000,
      scale: { start: 1.5, end: 0.2 },
      rotate: { start: 0, end: 180 }
    });

    this.jetpack.setDepth(2.5);
    this.boostjetpack.setDepth(2.5);
    this.blood = this.scene.add.particles(0, 0, "blood", {
      frame: [0, 1, 2, 3, 4],
      lifespan: 3000,
      emitting: false,
      frequency: 1000,
      alpha: {start: 3, end: 0},
      scale: { min: 1, max: 2.5 },
      speed: { min: 5, max: 50},
      rotate: {start: 0, end: 180 }
    })
    this.blood.setDepth(2.5)

    this.radius = PLAYER_RADIUS;

    this.once('destroy', () => {
      this.text.destroy();
      this.jetpack.destroy();
      this.boostjetpack.destroy();
      this.playerColor.destroy();
    })

    if (state) {
      this.initializePlayer(state);
    }
    // this.die();

  }

  private initializePlayer(player: Player) {
    player.onChange(() => {
      this.setData<Player>("state", player);
    });
  }

  public die(): void {
    this.destroy();
    this.blood.emitParticleAt(this.x, this.y, 16);

  }

  public override update(time: number, dt: number) {
    if (!this.active) {
      return;
    }
    if (this.text) {
      this.text.x = this.x - this.text.width / 2;
      this.text.y = this.y - PLAYER_RADIUS - this.text.height - 5;
    }

    if (this.emitterCounter-- <= 0) {
      const emitAt1 = [
        this.x + Math.cos(this.rotation + Math.PI/2.2) * 40,
        this.y + Math.sin(this.rotation + Math.PI/2.2) * 40,
      ];
      const emitAt2 = [
        this.x + Math.cos(this.rotation + Math.PI/1.8) * 40,
        this.y + Math.sin(this.rotation + Math.PI/1.8) * 40,
      ];
      let jetpack;
      if (this.boostActive) {
        this.scene.cameras.main.shake(100, 0.001);
        this.emitterCounter = 6;
        jetpack = this.boostjetpack;
      } else {
        this.emitterCounter = 8;
        jetpack = this.jetpack;
      }
      jetpack.emitParticleAt(emitAt1[0], emitAt1[1], 1);
      jetpack.emitParticleAt(emitAt2[0], emitAt2[1], 1);

    }

    this.sync();
    this.playerColor.x = this.x;
    this.playerColor.y = this.y;
    const shake = Math.random() * 100;
    const oxyPct = (100 - this.oxygen)/ 100;
    this.setScale(1.0 + (oxyPct  / (2 + shake)));
    if (this.oxygen < 100) {
      this.scene.cameras.main.shake(100, 0.0025 * oxyPct);
    }
  }

  protected sync() {
    const serverState: Player = this.getData("state");
    if (!serverState) return;
    this.x = Phaser.Math.Linear(this.x, serverState.x, 0.2);
    this.y = Phaser.Math.Linear(this.y, serverState.y, 0.2);
    this.velocityX = Phaser.Math.Linear(this.velocityX, serverState.velocityX, 0.2);
    this.velocityY = Phaser.Math.Linear(this.velocityY, serverState.velocityY, 0.2);
    this.boost = serverState.boost;
    this.boostActive = serverState.boostEngaged;
    this.oxygen = serverState.oxygen
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
    boost: number,
    boostActive: boolean,
    oxygen: number,
    state?: Player,
  ) {
    super(scene, x, y, velocityX, velocityY, color, name, boost, boostActive, oxygen, state);
    this.cameraPoint = {
      x,
      y
    };
    this.viewDir = [0, -1];
    this.viewDirTarget = [0, -1];
  }

  public handleInput(input: InputHandler) {
    if (!this.active) {
      return;
    }
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
    this.rotation = lerpAngle(this.rotation, viewDirTargetAngle, 0.2);
    this.playerColor.rotation = this.rotation;
  }

  protected override sync() {
    super.sync();
    if (this.scene) {
      this.scene.events.emit('boost', this.boost);
    }
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
      playerPrefab.boost,
      playerPrefab.boostActive,
      playerPrefab.oxygen,
      serverState
    );

    this.setAlpha(0.25);
    serverState.onChange(() => {
      this.playerPrefab.setData("state", serverState);
      this.setPosition(serverState.x, serverState.y);
    });
  }
}
