var nodestatic = require('node-static');
var fs = new nodestatic.Server('./www');

var server = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
        fs.serve(request, response);
    }).resume();
});

server.listen(8000);

var io = require('socket.io').listen(server, {log: false});

io.sockets.on('connection', function (socket) {
    socket.emit('newPlayer', socket.id);

    socket.on('sit', function(seat) {
        console.log(socket.id+' tried to sit on seat'+seat+'.');
    });

});

