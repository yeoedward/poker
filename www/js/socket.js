var socket = io.connect('http://localhost:8000');

var toCall;
var playerBet;
var playerNum;

socket.on('playerNum', function (n) {
    playerNum = n;
    $("#playerName").text("Player "+n);
});

socket.on('startGame', function (id) {
    $("#waitingMsg").css("display", "none");
    init(); 
});

socket.on('yourTurn', function (newToCall, minRaise, maxRaise, bet) {
    playerBet = bet;
    toCall = newToCall;
    $("#raiseAmt").attr("min", minRaise);
    console.log("minRaise = "+minRaise);
    $("#raiseAmt").attr("max", maxRaise);
    console.log("maxRaise = "+maxRaise);
    $("#raiseAmt").val(minRaise);
    $("#hud").css("display", "block");  
});

socket.on('player1Bet', function (amt, stack) {
    player1Bet(amt);
    console.log("Player 1's stack: "+stack);
});

socket.on('player2Bet', function (amt, stack) {
    player2Bet(amt);
    console.log("Player 2's stack: "+stack);
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
    clearBets();
});

socket.on('turn', function (card) {
    turn(card);
    clearBets();
});

socket.on('river', function (card) {
    river(card);
    clearBets();
});

socket.on('pot', function (pot) {
    console.log('Pot size: '+pot);
});


function initBtns () {
    $("#foldBtn").click(function () {
        makeMove(-1);
    });

    $("#callBtn").click(function () {
        makeMove(toCall);
    });

    $("#raiseBtn").click(function () {
        var raiseTo = parseInt($("#raiseAmt").val());
        var raiseBy = raiseTo - playerBet;
        console.log("raising by "+raiseBy);
        makeMove(raiseBy);
    });
}

/* Make bet */
function makeMove(b) {
    $("#hud").css("display", "none");
    socket.emit('makeMove', b);     
};

