module.exports = {
    io: io
};

var Dealer = require('./gamelogic/dealer');
var Player = require('./gamelogic/player');

var nodestatic = require('node-static');
var fs = new nodestatic.Server('./www');

var server = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
        fs.serve(request, response);
    }).resume();
});

server.listen(8000);

var io = require('socket.io').listen(server, {log: false});

var players = [];

function io () {
    return io;
}

io.sockets.on('connection', function (socket) {
    console.log(socket + " connected.");
    players.push(socket);
    socket.emit('playerNum', players.length);
    if (players.length > 2) players = [];
    if (players.length === 2) {
        console.log("starting game...");
        io.sockets.emit('startGame');

        var d = new Dealer(1,3,100);
        d.addPlayer(new Player(players[0]), 0);
        d.addPlayer(new Player(players[1]), 1);
        d.startGame();
    }
});
