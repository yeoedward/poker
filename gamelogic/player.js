module.exports = Player;

function Player(socket) {
    this.socket = socket;
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
    if (this.cards.length === 2)
        this.socket.emit('dealCards', this.cards);
};

Player.prototype.amt = function () {
    return this.bet;
};

Player.prototype.move = function (toCall, action) {
    var amtToCall = toCall - this.bet;
    var minRaise = 2*amtToCall;
    this.socket.emit('yourTurn', amtToCall, minRaise, this.stack);
    var player = this;
    this.socket.once('makeMove', function (b) {
        if (b === -1) {
            action(true);
        } else {
            player.bet += b;
            player.stack -= b;
            action(false);
        }
    });
};

Player.prototype.ship = function (amt) {
    this.stack += amt;
};

Player.prototype.getCards = function () {
    return this.cards;
};

Player.prototype.broke = function () {
    return this.stack === 0;
};

Player.prototype.muck = function () {
    this.cards = [];
};
