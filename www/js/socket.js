var socket = io.connect('http://localhost:8000');
socket.on('newPlayer', function (id) {
        console.log(id);
        socket.emit('sit', 0);
});

