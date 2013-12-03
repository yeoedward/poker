var socket = io.connect('http://localhost:8000');

var toCall;
var playerBet;
var playerNum;
var myStack;

socket.on('playerNum', function (n) {
    playerNum = n;
    $("#playerName").text("Player "+n);
});

socket.on('startGame', function (stack) {
    $("#waitingMsg").css("display", "none");
    init(); 
    stack1(stack);
    stack2(stack);
    myStack = stack;
});

socket.on('startHand', function () {
    clearShowdownMsg();
    clearHand();
    pot(0);
});

socket.on('yourTurn', function (newToCall, minRaise, maxRaise, bet) {
    playerBet = bet;
    toCall = newToCall;
    $("#raiseAmt").attr("min", minRaise);
    $("#raiseAmt").attr("max", maxRaise);
    $("#raiseAmt").val(minRaise);
    $("#raiseBtn").val("Raise "+minRaise);
    $("#raiseAmt").css("display","");
    $("#raiseBtn").css("display","");
    console.log("minRaise= "+minRaise);
    console.log("maxRaise= "+maxRaise);
    if (maxRaise < minRaise) {
        $("#raiseAmt").css("display","none");
        $("#raiseBtn").css("display","none");
    }
    $("#buttons").css("display", "block");  
});

socket.on('player1Bet', function (amt, stack) {
    player1Bet(amt);
    stack1(stack);
    if(playerNum === 1)
        myStack = stack;
});

socket.on('player2Bet', function (amt, stack) {
    player2Bet(amt);
    stack2(stack);
    if(playerNum === 2)
        myStack = stack;
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

socket.on('stack1', function (size) {
    stack1(size);
});

socket.on('stack2', function (size) {
    stack1(size);
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
    $("#myCanvas").css("display","none");
    $("#hud").css("display","none");
    var msg;

    if (playerNum === pos) {
        msg = "Congratulations, you won!"; 
    } else {
        msg = "Sorry, you lost...";
    }

    $("#endGame").text(msg);
});

function initWidgets () {
    $("#foldBtn").click(function () {
        makeMove(-1);
    });

    $("#callBtn").click(function () {
        if (toCall > myStack) {
            makeMove(myStack - playerBet);
        } else {
            makeMove(toCall);
        }
    });

    $("#raiseBtn").click(function () {
        var raiseTo = parseInt($("#raiseAmt").val());
        var raiseBy = raiseTo - playerBet;
        makeMove(raiseBy);
    });

    $("#raiseAmt").change(function () {
        var newVal = $("#raiseAmt").val();
        $("#raiseBtn").val("Raise "+newVal);
    });
}

/* Make bet */
function makeMove(b) {
    $("#buttons").css("display", "none");
    socket.emit('makeMove', b);     
};

