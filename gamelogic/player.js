module.exports = Player;

var readline = require('readline');

function Player() {
    this.cards = [];
    this.stack = 0;
    this.bet = 0;
}

Player.prototype.setStack = function (startStack) {
    this.stack = startStack;
};

Player.prototype.clearAmt = function () {
    this.bet = 0;
};

Player.prototype.postBlind = function (blind) {
    var posted = Math.min(this.stack, blind);
    this.stack -= posted;
    this.bet = posted;
};

Player.prototype.isAllIn = function () {
    return this.stack === 0;
};

Player.prototype.dealCard = function(card) {
    this.cards.push(card);
};

Player.prototype.amt = function () {
    return this.bet;
};

Player.prototype.move = function (toCall, action) {
    console.log(toCall-this.bet + " to call.");

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var player = this;
    rl.question("Bet?", function(answer) {
        var b = parseInt(answer);
        console.log(b);
        rl.close();
        console.log(player.bet);
        player.bet += b;
        console.log("this.bet = "+player.bet);
        player.stack -= b;
        action();
    });
};

Player.prototype.ship = function (amt) {
    this.stack += amt;
};


