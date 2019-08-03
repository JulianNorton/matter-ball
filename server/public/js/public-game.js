var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 600,
    height: 600,
    backgroundColor: "#666666",
    physics: {
        default: 'matter',
        matter: {
            wireframe: true,
            debug: true,
            ignoreGravity: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
    
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('placeholder', 'assets/placeholder-image.png');
}

function create() {
    var self = this;

    this.socket = io();
    this.players = this.add.group();
    
    // add.bodies.circle(200, 200, 30, 2);
    var ball = self.matter.add.circle(500, 500, 30, 2);

    console.log(ball)

    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                displayPlayers(self, players[id], 'ship');
            } else {
                displayPlayers(self, players[id], 'otherPlayer');
            }
        });
    });
    
    this.socket.on('newPlayer', function (playerInfo) {
        displayPlayers(self, playerInfo, 'otherPlayer');
    });
    
    this.socket.on('disconnect', function (playerId) {
        self.players.getChildren().forEach(function (player) {
            if (playerId === player.playerId) {
                player.destroy();
                console.log('destroyed player', playerId)
            }
        });
    });
    
    this.socket.on('playerUpdates', function (players) {
        Object.keys(players).forEach(function (id) {
            self.players.getChildren().forEach(function (player) {
                if (players[id].playerId === player.playerId) {
                    player.setPosition(players[id].x, players[id].y);
                }
            });
        });
    });
    
    this.matter.world.setBounds().disableGravity().update60Hz();
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;
    this.upKeyPressed = false;
    this.downKeyPressed = false;
    console.log(ball)
}

function update() {

    const left = this.leftKeyPressed;
    const right = this.rightKeyPressed;
    const up = this.upKeyPressed;
    const down = this.downKeyPressed;
    
    if (this.cursors.left.isDown) {
        this.leftKeyPressed = true;
    }
    else if (this.cursors.right.isDown) {
        this.rightKeyPressed = true;
    } else {
        this.leftKeyPressed = false;
        this.rightKeyPressed = false;
    }
    
    if (this.cursors.up.isDown) {
        this.upKeyPressed = true;
    }
    else if (this.cursors.down.isDown) {
        this.downKeyPressed = true;
    }
    else {
        this.upKeyPressed = false;
        this.downKeyPressed = false;
    }
    
    if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed || down !== this.downKeyPressed) {
        this.socket.emit('playerInput', { left: this.leftKeyPressed, right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed });
    }
}

function displayPlayers(self, playerInfo, sprite) {
    const player = self.matter.add.image(playerInfo.x, playerInfo.y, 'placeholder').setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    if (playerInfo.team === 'blue') player.setTint(0x0000ff);
    else player.setTint(0xff0000);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}
