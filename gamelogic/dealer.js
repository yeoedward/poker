module.exports = Dealer;

var Poker = require('poker-evaluator');
var Deck = require('./deck');
var Player = require('./player');

function Dealer(sb,bb,startStack) {
    this.sb = sb;
    this.bb = bb;
    this.startStack = startStack;
    this.deck = new Deck(); 
    this.players = new Array(2);
    this.players[0] = null;
    this.players[1] = null;

    this.allIn = false;
    this.button = 0;
    this.board = [];

    this.toCall = 0;
    this.pot = 0;
}

Dealer.prototype.addPlayer = function (p,seat) {
    if (this.players[seat] === null) {
        this.players[seat] = p;
        return true;
    }

    return false;
};

Dealer.prototype.startGame = function () {
    this.players[0].setStack(this.startStack*this.bb);
    this.players[1].setStack(this.startStack*this.bb);

    this.startHand();
};


Dealer.prototype.startHand = function () {
    console.log("new hand");
    this.board = [];
    this.allIn = false;
    this.players[0].muck();
    this.players[1].muck();
    
    this.players[this.button].postBlind(this.sb);
    this.players[nextPlayer(this.button)].postBlind(this.bb);

    if (this.players[0].isAllIn() || this.players[1].isAllIn())
        this.allIn = true;

    this.deck.shuffle();
    for (var i=0; i<2; i++) {
        this.players[0].dealCard(this.deck.nextCard());
        this.players[1].dealCard(this.deck.nextCard());
    }

    this.toCall = this.players[nextPlayer(this.button)].amt();
    this.pot = 0;
    console.log("Pot: "+this.pot);

    if (this.allIn)
        this.nextStreet();
    else {
        var dealer = this;
        this.players[this.button].move(this.toCall, function (fold) {
            dealer.action(dealer.button,fold);
        });
    }
};

Dealer.prototype.nextStreet = function () {
    this.pot += this.players[0].amt() + this.players[1].amt();
    console.log("Pot: " + this.pot);
    this.players[0].clearAmt();
    this.players[1].clearAmt();

    this.toCall = 0;

    if (this.allIn === true) {
        while (this.board.length < 5)
            this.board.push(this.deck.nextCard());            
    } else {
    
        var dealer = this;
        switch (this.board.length) {
            case 0:
                this.board.push(this.deck.nextCard());            
                this.board.push(this.deck.nextCard());            
                this.board.push(this.deck.nextCard());            
                console.log(this.board);
                this.players[nextPlayer(this.button)].move(this.toCall,
                    function (fold) {
                        dealer.action(nextPlayer(dealer.button), fold);
                });
                return;
            case 3:
            case 4:
                this.board.push(this.deck.nextCard());            
                console.log(this.board);
                this.players[nextPlayer(this.button)].move(this.toCall,
                function (fold) {
                    console.log("Player "+nextPlayer(dealer.button)+
                                " bet "+
                                dealer.players[nextPlayer(dealer.button)]
                                      .amt()+".");
                        dealer.action(nextPlayer(dealer.button), fold);
                });
                return;
        };

    }

    console.log('showdown');
    var h1 = Poker.evalHand(this.players[0].getCards().concat(this.board));
    var h2 = Poker.evalHand(this.players[1].getCards().concat(this.board));
    if (h1.handType === h2.handType && h1.handRank === h2.handRank)
        this.tie();
    else if (h1.handType >= h2.handType && h1.handRank > h2.handRank)
        this.win(0);
    else
        this.win(1);
};

Dealer.prototype.win = function (pos) {
    console.log("Player "+pos+" wins and ships "+this.pot+".");
    this.players[pos].ship(this.pot);
    if (this.players[nextPlayer(pos)].broke())
        this.endGame(pos);
    else {
        this.button = nextPlayer(this.button);
        this.startHand();
    }
};

Dealer.prototype.endGame = function (pos) {
    console.log("Player "+pos+" wins the heads up tournament!");
};

Dealer.prototype.tie = function () {
    var numSBs = this.pot / this.sb / 2;
    var btnShare = Math.floor(numSBs) * this.sb;
    var bbShare = Math.ceiling(numSBs) * this.sb;

    this.players[this.button].ship(btnShare);
    this.players[nextPlayer(this.button)].ship(bbShare);

    this.button = nextPlayer(this.button);
    this.startHand();
};

Dealer.prototype.action = function (pos,fold) {
    var amt = this.players[pos].amt();

    /* Check if player folded */
    if (fold) {
        this.pot += this.players[0].amt() + this.players[1].amt();
        this.win(nextPlayer(pos));
        return;
    }

    /* Big blind option */
    var calledRaise = this.toCall === amt && this.toCall > 0;
    var preflop = this.board.length === 0;
    calledRaise = calledRaise && !(pos === this.button && preflop
                                        && this.toCall === this.bb);
    var checkedOnBtn = this.toCall === 0 && amt === 0 && 
                                            pos === this.button;

    console.log("Stack size: "+this.players[pos].stack);
    console.log(this.players[pos].isAllIn());

    /* If someone called an all-in */
    if ((this.players[pos].isAllIn() || 
         this.players[nextPlayer(pos)].isAllIn())
        && this.toCall >= amt) {
        this.allIn = true;

        /* Return extra chips to other player */
        if (this.toCall > amt) {
            this.players[nextPlayer(pos)].ship(this.toCall - amt);
        }
    }

    console.log("toCall = "+amt);
    this.toCall = amt;

    /* Check if player's action closes the betting round */
    if (this.allIn || calledRaise || checkedOnBtn) {
        this.nextStreet();
    } else {
        var dealer = this;
        this.players[nextPlayer(pos)].move(this.toCall, function (fold) {
            console.log("Player "+nextPlayer(pos)+
                        " bet "+dealer.players[nextPlayer(pos)].amt()+
                        ".");
            dealer.action(nextPlayer(pos), fold);
        });
    }
};

function nextPlayer(pos) {
    return (pos+1) % 2;
}


function test() {
    var d = new Dealer(1,3,100);
    d.addPlayer(new Player(), 0);
    d.addPlayer(new Player(), 1);
    d.startGame();
}

test();
