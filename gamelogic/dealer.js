module.exports = Dealer;

var Deck = require('./deck');
var Poker = require('poker-evaluator');
var Player = require('./player');

function Dealer(blinds) {
    this.sb = blinds[0];
    this.bb = blinds[1];

    this.inProgress = false;
    this.numPlayers = 0;
    this.players = new Array(9);
    for (var i=0; i<9; i++)
        this.players[i] = null;

    this.deck = new Deck();
    this.button = 0;

    this.pot = 0;
    this.board = [];

    this.turn = 0;
    this.bet = 0;
    this.close = 0;
    this.active = new Array(9);
    this.round = new Array(9);
    for (var i=0; i<9; i++)
        this.round[i] = 0;

    this.street = 0;
}

Dealer.prototype.addPlayer = function (p,i) {
    if (this.players[i] === null) {
        this.players[i] = p;
        this.numPlayers++;
    }
    if (!this.inProgress)
        this.startGame();
};

Dealer.prototype.removePlayer = function (i) {
    this.players[i] = null;
    this.numPlayers--;
    if (this.turn === i)
        action(i,-1);
};

Dealer.prototype.win = function (i) {
    this.players[i].shipIt(this.pot);
    this.players.map(function (p) {if (p !== null) p.muck();});
    //this.startGame();
};

Dealer.prototype.showdown = function () {
    var board = this.board.map(function (c) {return c.toString();});

    var hands = this.players.map(function (p) {
        if (p !== null) {
            return board.concat(p.cards);
        }
        return null;
    });

    var rated = hands.map(function (L) {
        if (L !== null) {
            return Poker.evalHand(L);
        }
        return null;
    });
    var max = -1;
    var maxType = -1;
    var maxRank = -1;
    for(var i=0; i<rated.length; i++) {
        if (rated[i] !== null && rated[i].handType >= maxType && 
                              rated[i].handRank > maxRank) {
            max = i;
            maxType = rated[i].handType;
            maxRank = rated[i].handRank;
        }
    }
    
    this.win(max);
};

Dealer.prototype.nextRound = function () {
    switch (this.street) {
        //flop
        case 0:
            this.board.push(this.deck.nextCard());
            this.board.push(this.deck.nextCard());
            this.board.push(this.deck.nextCard());
            break;
        //turn & river
        case 1:
        case 2:
            this.board.push(this.deck.nextCard());
            break;
        // showdown
        case 3:
            this.showdown();
            return;
    }

    console.log(this.board);
    this.street++;
    this.turn = this.firstToAct();
    this.players[this.turn].move(this,this.action,this.turn);
};

Dealer.prototype.nextPlayer = function (i) {
    var pos = (i+1) % 9;
    while(this.active[pos] === false) {
        pos = (pos+1) % 9;
    }
    return pos;
};

Dealer.prototype.action = function (i,amt) {
    if (amt === -1) {
        this.active[i] = false;
        console.log("Player "+i+" folds");
    }

    if (amt === 0)
        console.log("Player "+i+" checks");
    if (amt > 0) {
        console.log("Player "+i+" makes bet of "+amt);
        this.round[i] = amt;
        if (amt > this.bet) {
            this.close = i;
            this.bet = amt;
        }
    }

    var j = this.nextPlayer(i);
    if (j === i)
        win(i);
    else if (j === this.close) {
        this.nextRound();
    } else {
        this.turn = j;
        this.players[j].move(this,this.action,j);
    }
};

Dealer.prototype.getBlinds = function (start) {
    var sb;
    if (this.numPlayers === 2)
        sb = this.button;
    else
        sb = this.nextPlayer(this.button);
    this.players[sb].postBlind(this.sb);
    this.round[sb] = this.sb;
    var bb = this.nextPlayer(sb);
    this.players[bb].postBlind(this.bb);
    this.round[bb] = this.bb;
    this.close = bb;
};

Dealer.prototype.advanceButton = function () {
    this.button = this.nextPlayer(this.button);
};

Dealer.prototype.dealCards = function () {
    for (var n=0; n<2; n++)
        for (var i=0; i<this.active.length; i++)
            if (this.active[i])
                this.players[i].dealCard(this.deck.nextCard());
};

Dealer.prototype.firstToAct = function () {
    if (this.numPlayers === 2) 
        return this.button;
    var pos = this.nextPlayer(this.button+2);
    return pos;
};

Dealer.prototype.startGame = function () {
    console.log("Starting game");
    if (this.numPlayers < 3) {
        console.log("Too few players!");
        this.inProgress = false;
        return; 
    }

    this.inProgress = true;

    for(var i=0; i<this.active.length; i++) {
        if (this.players[i] === null || this.players[i].broke())
            this.active[i] = false;
        else
            this.active[i] = true;
    }

    this.round = this.round.map(function (t) {return 0;});
    this.street = 0;
    this.board = [];

    this.advanceButton();
    this.getBlinds();
    this.deck.shuffle();
    this.dealCards();
    this.turn = this.firstToAct();
    this.players[this.turn].move(this,this.action, this.turn);
};

var d = new Dealer([1,3]);
d.addPlayer(new Player(1000),0);
d.addPlayer(new Player(1000),1);
d.addPlayer(new Player(1000),2);
