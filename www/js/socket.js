var socket = io.connect('http://localhost:8000');

socket.on('startGame', function (id) {
    $("#waitingMsg").css("display", "none");
    init(); 
});

socket.on('yourTurn', function (toCall) {
    $("#hud").css("display", "block");  
});

socket.on('player1Bet', function (toCall) {

});
