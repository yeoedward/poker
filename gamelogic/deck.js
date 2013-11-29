module.exports = Deck;

var Card = require('./card');

function Deck() {
    this.cards = [];
    for (var i=0; i<52; i++) {
        this.cards.push(card(i));
    }
    this.position = 0;
}

Deck.prototype.shuffle = function () {
    for (var i=0; i<52; i++) {
        swap(this.cards, i, randInt(i,51));
    }
    this.position = 0;
};

Deck.prototype.nextCard = function () {
    var card = this.cards[this.position];
    this.position++;
    return card;
};

Deck.prototype.toString = function () {
    return this.cards.join(', ');
};

function swap(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function randInt(low, high) {
    var r = Math.random();
    return Math.floor(r * (high - low + 1)) + low;
}

function card(n) {
    return numToRank(n) + numToSuit(n);
}

function numToRank(n) {
    var r = n % 13;
    switch(r) {
        case 8:
            return 'T';
        case 9:
            return 'J';
        case 10:
            return 'Q';
        case 11:
            return 'K';
        case 12:
            return 'A';
    }

    return (r+2).toString();
}

function numToSuit(n) {
    var s = Math.floor(n / 13);
    switch(s) {
        case 0:
            return 's'
        case 1:
            return 'h';
        case 2:
            return 'd';
        case 3:
            return 'c';
    }

    throw new Error("invalid suit number");
}

