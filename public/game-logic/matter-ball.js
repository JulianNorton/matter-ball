
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
            ignoreGravity: true,
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
    var self = this;
    this.socket = io();
    this.otherPlayers = this.add.group();
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });
    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
                console.log('destroyed player', playerId)
            }
        });
    });

    this.matter.world.setBounds().disableGravity();

    this.helpText = this.add.text(32, 32, 'Press spacebar for another ball', { fontSize: '1rem', fill: 'red' });

    // Set boundries
    // floor
    this.matter.add.rectangle(100, 550, 300, 300, { isStatic: true });


    // Soccerball
    ball = this.matter.add.circle(100,50,32,0);

    // Set-up keyboard input
    cursors = this.input.keyboard.createCursorKeys();

    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });
    
}

function update() {

    // ms delay on adding circle
    if (this.input.keyboard.checkDown(cursors.space, 500)) {
        this.matter.add.circle(100, 50, 32, 0);
    }

    if (this.ship) {
        // emit player movement
        var x = this.ship.x;
        var y = this.ship.y;
        var r = this.ship.rotation;
        if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
            this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
        }

        // save old position data
        this.ship.oldPosition = {
            x: this.ship.x,
            y: this.ship.y,
            rotation: this.ship.rotation
        };
        if (cursors.left.isDown) {
            // this.ship.setAngularVelocity(-.1);
            this.ship.thrustLeft(.01);
        } else if (cursors.right.isDown) {
            // this.ship.setAngularVelocity(.01);
            this.ship.thrustRight(.01);
        } else {
            // this.ship.setAngularVelocity(0);
        }
        
        if (cursors.up.isDown) {
            // this.ship.setAngularVelocity(0);
            this.ship.thrust(.01);
        } else if (cursors.down.isDown) {
            this.ship.thrustBack(.01)
        }

    }


}

function addPlayer(self, playerInfo) {

    // player = this.matter.add.image(200, 200, 'placeholder').setScale(1,1);
    self.ship = self.matter.add.image(playerInfo.x, playerInfo.y, 'placeholder').setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    self.ship.setFixedRotation();
    self.ship.setAngle(270);
    self.ship.setMass(1);
    self.ship.setFrictionAir(.2);
    // // player.setFixedRotation();
    // player.setAngle(270);
    // player.setMass(20);
    
    if (playerInfo.team === 'team_one') {
        self.ship.setTint(0x00ff00);
    } else {
        self.ship.setTint(0xffff00);
    }
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.matter.add.image(playerInfo.x, playerInfo.y, 'placeholder').setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    
    if (playerInfo.team === 'team_one') {
        otherPlayer.setTint(0xffffff);
    } else {
        otherPlayer.setTint(0x000000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}