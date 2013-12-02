var socket = io.connect('http://localhost:8000');

socket.on('startGame', function (id) {
    $("#waitingMsg").css("display", "none");
    init(); 
});

socket.on('yourTurn', function (toCall) {
    $("#hud").css("display", "block");  
});

socket.on('player1Bet', function (amt) {
    player1Bet(amt);
});

socket.on('player2Bet', function (amt) {
    player2Bet(amt);
});

socket.on('dealCard1', function (cards) {
    player1Cards(cards);
});

socket.on('dealCard2', function (cards) {
    player2Cards(cards);
});

socket.on('flop', function (cards) {
    flop(cards);
});

socket.on('turn', function (card) {
    turn(card);
});

socket.on('river', function (card) {
    river(card);
});

/* Make bet */
function makeMove() {
    
});
