module.exports = Dealer;

var Poker = require('poker-evaluator');
var Deck = require('./deck');
var Player = require('./player');
var Server = require('./../server');

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
    Server.io().sockets.emit("startHand");
    this.board = [];
    this.allIn = false;
    this.players[0].muck();
    this.players[1].muck();
    
    this.players[this.button].postBlind(this.button, this.sb);
    this.players[nextPlayer(this.button)].postBlind(nextPlayer(this.button),
                                                               this.bb);

    if (this.players[0].isAllIn() || this.players[1].isAllIn())
        this.allIn = true;

    this.deck.shuffle();
    for (var i=0; i<2; i++) {
        this.players[0].dealCard(this.deck.nextCard());
        this.players[1].dealCard(this.deck.nextCard());
    }

    this.toCall = this.players[nextPlayer(this.button)].amt();
    this.pot = 0;

    if (this.allIn)
        this.nextStreet();
    else {
        var dealer = this;
        this.players[this.button].move(dealer.button, this.toCall, function (fold) {
            dealer.action(dealer.button,fold);
        });
    }
};

Dealer.prototype.nextStreet = function () {
    this.pot += this.players[0].amt() + this.players[1].amt();
    Server.io().sockets.emit("pot", this.pot);

    this.players[0].clearAmt();
    this.players[1].clearAmt();

    this.toCall = 0;

    if (this.allIn === true) {
        while (this.board.length < 5) {
            this.board.push(this.deck.nextCard());            
            if (this.board.length === 3)
                Server.io().sockets.emit('flop', this.board);
            else if (this.board.length === 4)
                Server.io().sockets.emit('turn', this.board[3]);
            else if (this.board.length === 5)
                Server.io().sockets.emit('river', this.board[4]);
        }
    } else {
    
        var dealer = this;
        switch (this.board.length) {
            case 0:
                this.board.push(this.deck.nextCard());            
                this.board.push(this.deck.nextCard());            
                this.board.push(this.deck.nextCard());            
                Server.io().sockets.emit('flop', this.board);
                var pos = nextPlayer(this.button);
                this.players[pos].move(pos, this.toCall,
                    function (fold) {
                        dealer.action(pos, fold);
                });
                return;
            case 3:
            case 4:
                this.board.push(this.deck.nextCard());            
                if (this.board.length === 4)
                    Server.io().sockets.emit('turn', this.board[3]);
                else if (this.board.length === 5)
                    Server.io().sockets.emit('river', this.board[4]);
                var pos = nextPlayer(this.button);
                this.players[pos].move(pos, this.toCall,
                function (fold) {
                        dealer.action(pos, fold);
                });
                return;
        };

    }

    Server.io().sockets.emit('revealCards', [this.players[0].getCards(),
                                             this.players[1].getCards()]);
    var h1 = Poker.evalHand(this.players[0].getCards().concat(this.board));
    var h2 = Poker.evalHand(this.players[1].getCards().concat(this.board));
    if (h1.handType === h2.handType && h1.handRank === h2.handRank)
        this.tie(h1.handName);
    else if (h1.handType > h2.handType ||
             (h1.handType === h2.handType && h1.handRank > h2.handRank))
        this.win(0, h1.handName);
    else
        this.win(1, h2.handName);
};

Dealer.prototype.win = function (pos, hand) {
    this.players[pos].ship(this.pot);
    var handMsg=" because Player "+(nextPlayer(pos)+1)+" folded";
    if (hand !== null)
        handMsg = " with "+hand;
    Server.io().sockets.emit("showdown", 
                             "Player "+(pos+1)+" wins"+handMsg+".");
    var dealer = this;
    setTimeout(function () {
        if (dealer.players[nextPlayer(pos)].broke())
            dealer.endGame(pos);
        else {
            dealer.button = nextPlayer(dealer.button);
            dealer.startHand();
        }}, 5000);
};

Dealer.prototype.endGame = function (pos) {
    Server.io().sockets.emit('endGame', pos+1);
};

Dealer.prototype.tie = function (hand) {
    var numSBs = this.pot / this.sb / 2;
    var btnShare = Math.floor(numSBs) * this.sb;
    var bbShare = Math.ceil(numSBs) * this.sb;

    this.players[this.button].ship(btnShare);
    this.players[nextPlayer(this.button)].ship(bbShare);

    this.button = nextPlayer(this.button);

    Server.io().sockets.emit("showdown", "Both players tie with "+hand+".");
    var dealer = this;
    setTimeout(function () {dealer.startHand();}, 5000);
};

Dealer.prototype.action = function (pos,fold) {
    var amt = this.players[pos].amt();

    /* Check if player folded */
    if (fold) {
        this.pot += this.players[0].amt() + this.players[1].amt();
        this.win(nextPlayer(pos), null);
        return;
    }

    /* Big blind option */
    var calledRaise = this.toCall === amt && this.toCall > 0;
    var preflop = this.board.length === 0;
    calledRaise = calledRaise && !(pos === this.button && preflop
                                        && this.toCall === this.bb);
    var checkedOnBtn = this.toCall === 0 && amt === 0 && 
                                            pos === this.button;

    /* If someone called an all-in */
    if ((this.players[pos].isAllIn() || 
         this.players[nextPlayer(pos)].isAllIn())
        && this.toCall >= amt) {
        this.allIn = true;

        /* Return extra chips to other player */
        if (this.toCall > amt) {
            var otherPos = nextPlayer(pos);
            this.players[otherPos].ship(this.toCall - amt);
            Server.io().sockets.emit("stack"+otherPos,
                                     this.players[otherPos].getStack());
        }
    }

    this.toCall = amt;

    /* Check if player's action closes the betting round */
    if (this.allIn || calledRaise || checkedOnBtn) {
        this.nextStreet();
    } else {
        var dealer = this;
        var nextPos = nextPlayer(pos);
        this.players[nextPos].move(nextPos, this.toCall, function (fold) {
            dealer.action(nextPos, fold);
        });
    }
};

function nextPlayer(pos) {
    return (pos+1) % 2;
}

