import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../../util/Constants";

export class UIScene extends Phaser.Scene {
    private arrow: Phaser.GameObjects.Image;
    private bar: Phaser.GameObjects.Image;
    private meter: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'UIScene', active: false });
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("arrow", "arrow.png")
        this.load.image("mapBorder", "mapBorder.png");
        this.load.image("boostbar", "boostbar.png");
        this.load.image("boostmeter", "boostmeter.png")
        this.load.spritesheet("leftbutton", "leftbutton.png", {
            frameWidth: 24,
            frameHeight: 24,
            startFrame: 0,
            endFrame: 1
        });
        this.load.spritesheet("rightbutton", "rightbutton.png", {
            frameWidth: 24,
            frameHeight: 24,
            startFrame: 0,
            endFrame: 1
        });
    }

    create() {
        this.add.image(116, 116, "mapBorder");
        this.bar = this.add.image(4 + 128, SCREEN_HEIGHT - 38, "boostbar");
        this.bar.setScale(2);

        this.meter = this.add.image(4 + 128, SCREEN_HEIGHT - 38, "boostmeter");
        this.meter.setScale(2);

        this.arrow = this.add.image(this.sys.game.canvas.width / 2, 70, "arrow");
        this.arrow.scale = 2.5;

        const game = this.scene.get('Game');

        game.events.on('arrow', (rotation: number) => {
            this.arrow.rotation = rotation;
        })

        game.events.on('boost', (boost: number) => {
            this.meter.setCrop(0, 0, this.meter.width * (boost / 300), this.meter.height);
        });

        game.events.on('playerDead', () => {
            const left = this.add.sprite(SCREEN_WIDTH / 2 - 64, SCREEN_HEIGHT - 32, "leftbutton", 0)
                .setScale(2)
                .setInteractive()
                .on('pointerdown', () => {
                    left.setFrame(1);
                })
                .on('pointerup', () => {
                    left.setFrame(0);
                    game.events.emit('cameraLeft');
                })

            const right = this.add.sprite(SCREEN_WIDTH / 2 + 64, SCREEN_HEIGHT - 32, "rightbutton", 0)
                .setScale(2)
                .setInteractive()
                .on('pointerdown', () => {
                    right.setFrame(1);
                })
                .on('pointerup', () => {
                    right.setFrame(0);
                    game.events.emit('cameraRight');
                })

        });
    }
}
