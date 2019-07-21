var config = {
    type: Phaser.AUTO,
    width: 400,
    height: 400,
    backgroundColor: "#666666",
    parent: 'game-container',
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity: { y: .5 },
            wireframes: true,
            showAngleIndicator: true,
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('placeholder', 'assets/placeholder-image.png');
}

function create() {

    var image1 = this.add.image(100, 100, 'placeholder');
    var image2 = this.add.image(50, 50, '');

    container = this.add.container(100, 100, [image1, image2]);

    var rectangle = this.add.rectangle(250, 380, 200, 5, { isStatic: true })
    var ball = this.add.circle(300, 100, 30, 1)
    console.log(image1)
    console.log(ball)

    container.setSize(128, 64);
    var physicsContainer = this.physics.matter.add.gameObject(container);

    // MatterPhysics.Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
    // MatterPhysics.Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
    // MatterPhysics.Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),

    // // m/ walls
    // MatterPhysics.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    // MatterPhysics.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    // MatterPhysics.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    // MatterPhysics.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })

}

function update() {
    // cursors = this.input.keyboard.createCursorKeys();
    // if (cursors.spacebar.isDown) {
    // player.setVelocityX(-160);
    // }
}
