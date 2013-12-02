var canvas;
var cardFactor = 6;
var chipFactor = 15;
var p1Bet = [];
var p2Bet = [];
var board = [];
var hole1 = [];
var hole2 = [];
var potWidget = null;
var stack1Widget = null;
var stack2Widget = null;
var showdownMsg = null;


function initCanvas() {
    canvas = document.getElementById("myCanvas");
}

function toRank(c) {
    var r = c[0];
    switch (r) {
        case 'A':
            return 0;
        case 'T':
            return 9;
        case 'J':
            return 10;
        case 'Q':
            return 11;
        case 'K':
            return 12;
        default:
            return parseInt(r) - 1;
    }
}

function toSuit(c) {
    return c[1];
}


function scale (height, factor) {
    return canvas.height/factor/height; 
}

function cardWidth () {
    return 79;
}

function cardHeight () {
    return 123;
}

function getCard (c) {
    var wd = cardWidth();
    var ht = cardHeight();
    var x,y;
    if (c === "FD") {
        x = 2*wd;
        y = 4*ht;
    } else {
        var rank = toRank(c);
        var suit = toSuit(c);
        x = rank*wd;
        switch (suit) {
            case 'c':
                y = 0;
                break;
            case 'd':
                y = ht;
                break;
            case 'h':
                y = 2*ht;
                break;
            case 's':
                y = 3*ht;
                break;
        }
    }

    var cards = new Raster("cards");
    cards.visible = false;
    var rect = new Rectangle(x,y,wd,ht);
    var card = cards.getSubRaster(rect);
    cards.remove();
    card.scale(scale(cardHeight(), cardFactor));
    return card;
}


function pot (size) {
    var x = view.center.x - cardWidth() * scale(cardHeight(), cardFactor);;
    var y = view.center.y + 2 * cardHeight() * scale(cardHeight(), cardFactor);
    var text = new PointText(new Point(x,y));

    if (potWidget !== null) {
        potWidget.remove();
    }

    potWidget = text;
    text.fillColor = 'black';
    text.content = 'Pot size: '+size;
}

function stack1 (amt) {
    var width = cardWidth() * scale (cardHeight(), cardFactor);
    var x = view.center.x - 5*width;
    var y = view.center.y - 1.5 * cardHeight() * scale(cardHeight(), cardFactor);
    if (stack1Widget !== null)
        stack1Widget.remove();
    var text = new PointText(new Point(x,y));
    stack1Widget = text;
    text.fillColor = 'black';
    text.content = "Player 1's stack size: "+amt;
}

function stack2 (amt) {
    var width = cardWidth() * scale (cardHeight(), cardFactor);
    var x = view.center.x + 2*width;
    var y = view.center.y - 1.5 * cardHeight() * scale(cardHeight(), cardFactor);
    if (stack2Widget !== null)
        stack2Widget.remove();
    var text = new PointText(new Point(x,y));
    stack2Widget = text;
    text.fillColor = 'black';
    text.content = "Player 2's stack size: "+amt;
}

function flop (cards) {
    var flop = cards.map(function (c) {
        return getCard(c);
    });

    var width = cardWidth() * scale(cardHeight(), cardFactor);
    for (var i=0; i<3; i++) {
        flop[i].position.x = view.center.x + width*(i-2);
        flop[i].position.y = view.center.y;
        board.push(flop[i]);
    }
}

function turn (c) {
    var card = getCard(c);
    var width = cardWidth() * scale (cardHeight(), cardFactor);
    card.position.x = view.center.x + 1.25*width;
    card.position.y = view.center.y;
    board.push(card);
}

function river (c) {
    var card = getCard(c);
    var width = cardWidth() * scale (cardHeight(), cardFactor);
    card.position.x = view.center.x + 2.5*width;
    card.position.y = view.center.y;
    board.push(card);
}

function showdown (msg) {
    var x = view.center.x - 2*cardWidth() * scale(cardHeight(), cardFactor);;
    var y = view.center.y + cardHeight() * scale(cardHeight(), cardFactor);
    var text = new PointText(new Point(x,y));
    text.fillColor = 'black';
    text.content = msg;
    showdownMsg = text;
}

function player1Cards (cards) {
    cards = cards.map(function (c) {
        return getCard(c);
    });

    if (hole1.length > 0) {
        hole1.map(function(w) {w.remove();});
        hole1 = [];
    }

    var width = cardWidth() * scale (cardHeight(), cardFactor);
    hole1.map(function(w) {w.remove();});
    hole1 = [];
    for (var i=0; i<2; i++) {
        cards[i].position.x = view.center.x + width*(i/3-7);
        cards[i].position.y = view.center.y;
        hole1.push(cards[i]);
    }
}

function player2Cards (cards) {
    cards = cards.map(function (c) {
        return getCard(c);
    });

    if (hole2.length > 0) {
        hole2.map(function(w) {w.remove();});
        hole2 = [];
    }

    var width = cardWidth() * scale (cardHeight(), cardFactor);
    hole2.map(function(w) {w.remove();});
    hole2 = [];
    for (var i=0; i<2; i++) {
        cards[i].position.x = view.center.x - width*(i/3-7);
        cards[i].position.y = view.center.y;
        hole2.push(cards[i]);
    }
}

function player1Bet (amt) {
    var m = scale(cardHeight(), cardFactor);
    var x = view.center.x - 5 * cardWidth() * m
    var y = view.center.y;
    var text = new PointText(new Point(x,y));
    if (p1Bet.length > 0) {
        p1Bet.map(function (w) {w.remove();});
        p1Bet = [];
    }
    p1Bet.push(text);
    text.fillColor = 'black';
    text.content = '$'+amt;

    var chip = new Raster("redChip");
    p1Bet.push(chip);
    var n = scale(chip.height, chipFactor);
    chip.scale(n);
    chip.position.x = view.center.x - 3.5 * cardWidth() * m;
    chip.position.y = y;
}

function player2Bet (amt) {
    var m = scale(cardHeight(), cardFactor);
    var x = view.center.x + 5 * cardWidth() * m
    var y = view.center.y;
    var text = new PointText(new Point(x,y));
    if (p2Bet.length > 0) {
        p2Bet.map(function (w) {w.remove();});
        p2Bet = [];
    }
    p2Bet.push(text);
    text.fillColor = 'black';
    text.content = '$'+amt;

    var chip = new Raster("redChip");
    p2Bet.push(chip);
    var n = scale(chip.height, chipFactor);
    chip.scale(n);
    chip.position.x = view.center.x + 4 * cardWidth() * m;
    chip.position.y = y;
}


function clearHand() {
    board.map(function(w) {w.remove();});
    board = [];
    hole1.map(function(w) {w.remove();});
    hole1 = [];
    hole2.map(function(w) {w.remove();});
    hole2 = [];
    if (potWidget !== null)
        potWidget.remove();
    potWidget = null;
}

function clearBets() {
    if (p1Bet.length > 0) {
        p1Bet.map(function (w) {w.remove();});
        p1Bet = [];
    }

    if (p2Bet.length > 0) {
        p2Bet.map(function (w) {w.remove();});
        p2Bet = [];
    }
}

function clearShowdownMsg () {
    if (showdownMsg !== null)
        showdownMsg.remove();
}

function init () {
    paper.setup(canvas);
    paper.install(window);
    var table = new Raster("table");
    var tableBounds = new Rectangle(0,0, canvas.width, canvas.height); 
    table.fitBounds(tableBounds);
}


