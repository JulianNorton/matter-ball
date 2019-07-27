var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#666666",
    parent: 'game-container',
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity: { y: .1 },
            wireframes: true,
            showAngleIndicator: true,
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};
var player;
var cursors;
var game = new Phaser.Game(config);

function preload() {
    this.load.image('placeholder', 'assets/placeholder-image.png');
}

function create() {
    this.scoreText = this.add.text(32, 32, 'Press spacebar for another ball', { fontSize: '1rem', fill: 'red' });


    // Set boundries
    // floor
    this.matter.add.rectangle(300, 550, 600, 40, { isStatic: true });
    // right
    this.matter.add.rectangle(700, 300, 20, 600, { isStatic: true });
    // left
    this.matter.add.rectangle(0, 300, 20, 600, { isStatic: true });


    // Soccerball
    ball = this.matter.add.circle(100,50,32,0);

    // Player settings
    player = this.matter.add.image(200, 200, 'placeholder').setScale(.25,5);
    // player.setFixedRotation();
    player.setAngle(270);
    player.setFrictionAir(.9);
    player.setMass(50);

    // Set-up keyboard input
    cursors = this.input.keyboard.createCursorKeys();
    
}

function update() {
    if (cursors.left.isDown) {
        player.thrustLeft(1.5);
    }
    else if (cursors.right.isDown) {
        player.thrustRight(1.5);
    }

    if (cursors.up.isDown) {
        player.thrust(1.5);
    }
    else if (cursors.down.isDown) {
        player.thrustBack(1.5);
    }
    // ms delay on adding circle
    if (this.input.keyboard.checkDown(cursors.space, 500)) {
        this.matter.add.circle(100, 50, 32, 0);
    }
}
