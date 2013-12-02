var socket = io.connect('http://localhost:8000');

var toCall;
var playerBet;
var playerNum;

socket.on('playerNum', function (n) {
    playerNum = n;
    $("#playerName").text("Player "+n);
});

socket.on('startGame', function (stack) {
    $("#waitingMsg").css("display", "none");
    init(); 
    stack1(stack);
    stack2(stack);
});

socket.on('startHand', function (id) {
    clearShowdownMsg();
    clearHand();
    pot(0);
});

socket.on('yourTurn', function (newToCall, minRaise, maxRaise, bet) {
    playerBet = bet;
    toCall = newToCall;
    $("#raiseAmt").attr("min", minRaise);
    console.log("minRaise = "+minRaise);
    $("#raiseAmt").attr("max", maxRaise);
    console.log("maxRaise = "+maxRaise);
    $("#raiseAmt").val(minRaise);
    $("#raiseBtn").val("Raise "+minRaise);
    $("#raiseAmt").css("display","");
    $("#raiseBtn").css("display","");
    if (maxRaise < minRaise) {
        $("#raiseAmt").css("display","none");
        $("#raiseBtn").css("display","none");
    }
    $("#hud").css("display", "block");  
});

socket.on('player1Bet', function (amt, stack) {
    player1Bet(amt);
    stack1(stack);
});

socket.on('player2Bet', function (amt, stack) {
    player2Bet(amt);
    console.log("Player 2's stack: "+stack);
    stack2(stack);
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

socket.on('pot', function (size) {
    clearBets();
    pot(size);
});

socket.on('revealCards', function (cards) {
    player1Cards(cards[0]); 
    player2Cards(cards[1]); 
});

socket.on('showdown', function (str) {
    showdown(str);
});

socket.on('endGame', function(pos) {
    console.log("ENDGAME");
});

function initWidgets () {
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

    $("#raiseAmt").change(function () {
        var newVal = $("#raiseAmt").val();
        console.log(newVal);
        $("#raiseBtn").val("Raise "+newVal);
    });
}

/* Make bet */
function makeMove(b) {
    $("#hud").css("display", "none");
    socket.emit('makeMove', b);     
};

