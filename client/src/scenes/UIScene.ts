export class UIScene extends Phaser.Scene {
    private arrow: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'UIScene', active: true });
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("arrow", "arrow.png")
        this.load.image("mapBorder", "mapBorder.png");
    }

    create() {
        this.add.image(116, 116, "mapBorder");

        this.arrow = this.add.image(this.sys.game.canvas.width / 2, 70, "arrow");
        this.arrow.scale = 2.5;

        this.scene.get('Game').events.on('arrow', (rotation: number) => {
            this.arrow.rotation =  Phaser.Math.Linear(this.arrow.rotation, rotation, 0.1);
        })
    }
}