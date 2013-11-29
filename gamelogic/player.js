module.exports = Player;

var readline = require('readline');

function Player(buyin) {
    this.cards = [];
    this.stack = buyin;
}

Player.prototype.broke = function () {
    return this.stack === 0;
};

Player.prototype.dealCard = function (c) {
    this.cards.push(c);
};

Player.prototype.postBlind = function (blind) {
    this.stack -= blind;
};

Player.prototype.move = function (dealer, action,i) {

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    console.log(this.cards);
    console.log(this.stack);

    var p = this;
    rl.question("How much should player "+i+" bet? ", function(amt) {
            rl.close();
            var amt = parseInt(amt);
            p.stack -= amt;
            action.call(dealer,i,amt);
    });
};

Player.prototype.shipIt = function (pot) {
    this.stack += pot;
};

Player.prototype.muck = function () {
    this.cards = [];
};
