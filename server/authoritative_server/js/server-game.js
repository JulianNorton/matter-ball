const players = {};

const config = {
    type: Phaser.HEADLESS,
    parent: 'phaser-example',
    width: 600,
    height: 600,
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
        update: update
    },
    autoFocus: false
};

function preload() {
    this.load.image('placeholder', 'assets/placeholder-image.png');
}

function create() {
    const self = this;
    this.players = this.add.group();
      
    io.on('connection', function (socket) {
        console.log('a user connected');
        // create a new player and add it to our players object
        players[socket.id] = {
            rotation: 0,
            x: Math.floor(Math.random() * 700) + 50,
            y: Math.floor(Math.random() * 500) + 50,
            playerId: socket.id,
            team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
            input: {
                left: false,
                right: false,
                up: false,
                down: false
            }
        };
        // add player to server
        addPlayer(self, players[socket.id]);
        // send the players object to the new player
        socket.emit('currentPlayers', players);
        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);
        // send the star object to the new player
        
        socket.on('disconnect', function () {
            console.log('user disconnected');
            // remove player from server
            removePlayer(self, socket.id);
            // remove this player from our players object
            delete players[socket.id];
            // emit a message to all players to remove this player
            io.emit('disconnect', socket.id);
        });
        
        // when a player moves, update the player data
        socket.on('playerInput', function (inputData) {
            handlePlayerInput(self, socket.id, inputData);
        });
    });

    this.matter.world.setBounds().disableGravity();
    // Create an obstacle
    this.matter.add.rectangle(100, 550, 300, 300, { isStatic: false, mass: 1 });
    this.matter.add.circle(100, 550, 10, { mass: 1 });
    
    // this.matter.add.circle(100, 100, 50, 10, { mass: 1 });
    // Soccerball -- TODO -- unify this
    // this.matter.add.circle(100, 100, 50, 10, { mass: 1 });
    // var ball = self.matter.add.circle(100, 100, 20, 100)
    // this.matter.setMass(ball, .2);
    // ball.set(ball, mass, 1 )
    // this.matter.ball.setMass(20)
}

function update() {
    this.players.getChildren().forEach((player) => {
        const input = players[player.playerId].input;
        if (input.left) {
            player.thrustLeft(.01);
        } else if (input.right) {
            player.thrustRight(.01);
        } else {
            player.setAngularVelocity(0);
        }
        
        if (input.up) {
            player.thrust(.01);
        } else if (input.down) {
                player.thrustBack(.01);
        } else {
            // pass
        }
        
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
        players[player.playerId].rotation = player.rotation;
    });
    io.emit('playerUpdates', players);
}

function randomPosition(max) {
    return Math.floor(Math.random() * max) + 50;
}

function handlePlayerInput(self, playerId, input) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            players[player.playerId].input = input;
        }
    });
}

function addPlayer(self, playerInfo) {
    const player = self.matter.add.image(playerInfo.x, playerInfo.y, 'placeholder').setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    player.setFixedRotation();
    player.setAngle(270);
    player.setMass(1);
    player.setFrictionAir(.2);
    
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}

function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            player.destroy();
        }
    });
}

const game = new Phaser.Game(config);
window.gameLoaded();
