var socket = io.connect('http://localhost:8000');

var toCall;
var playerNum;

socket.on('playerNum', function (n) {
    playerNum = n;
    $("#playerName").text("Player "+n);
});

socket.on('startGame', function (id) {
    $("#waitingMsg").css("display", "none");
    init(); 
});

socket.on('yourTurn', function (newToCall, minRaise, stack) {
    toCall = newToCall;
    $("#raiseAmt").attr("min", minRaise);
    $("#raiseAmt").attr("max", stack);
    $("#raiseAmt").val(minRaise);
    $("#hud").css("display", "block");  
});

socket.on('player1Bet', function (amt) {
    player1Bet(amt);
});

socket.on('player2Bet', function (amt) {
    player2Bet(amt);
});

socket.on('dealCards', function (cards) {
    if (playerNum === 1) {
        player1Cards(cards);
        player2Cards(['FD','FD']);
    } else {
        player1Cards(['FD','FD']);
        player2Cards(cards);
    }
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


function initBtns () {
    $("#foldBtn").click(function () {
        makeMove(-1);
    });

    $("#callBtn").click(function () {
        makeMove(toCall);
    });

    $("#raiseBtn").click(function () {
        makeMove(parseInt($("#raiseAmt").val()));
    });
}

/* Make bet */
function makeMove(b) {
    $("#hud").css("display", "none");
    socket.emit('makeMove', b);     
};
