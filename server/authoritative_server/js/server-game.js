const players = {};

const config = {
    type: Phaser.HEADLESS,
    parent: 'phaser-example',
    width: 600,
    height: 600,
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
        // console.log('a user connected');
        // create a new player and add it to our players object
        players[socket.id] = {
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

    this.matter.world.setBounds().disableGravity().update60Hz();

}

function update() {
    this.players.getChildren().forEach((player) => {
        const input = players[player.playerId].input;
        if (input.left) {
            player.setVelocityX(-5);
        } else if (input.right) {
            player.setVelocityX(5);
        }
        
        if (input.up) {
            player.setVelocityY(-5);
        } else if (input.down) {
            player.setVelocityY(5);
        }

        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
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
    player.setFixedRotation(true);
    player.setMass(2.5);
    player.setFrictionAir(.22);
    
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
