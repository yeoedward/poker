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

var cardFactor = 6;

var chipFactor = 15;

var betWidgets = [];

function scale (height, canvas, factor) {
    return canvas.height/factor/height; 
}

function cardWidth () {
    return 79;
}

function cardHeight () {
    return 123;
}

function getCard (c, canvas) {
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
    card.scale(scale(cardHeight(), canvas, cardFactor));
    return card;
}


function flop (cards, canvas) {
    var flop = cards.map(function (c) {
        return getCard(c, canvas);
    });

    var width = cardWidth() * scale(cardHeight(), canvas, cardFactor);
    for (var i=0; i<3; i++) {
        flop[i].position.x = view.center.x + width*(i-2);
        flop[i].position.y = view.center.y;
    }
}

function turn (c, canvas) {
    var card = getCard(c, canvas);
    var width = cardWidth() * scale (cardHeight(), canvas, cardFactor);
    card.position.x = view.center.x + 1.25*width;
    card.position.y = view.center.y;
}

function river (c, canvas) {
    var card = getCard(c, canvas);
    var width = cardWidth() * scale (cardHeight(), canvas, cardFactor);
    card.position.x = view.center.x + 2.5*width;
    card.position.y = view.center.y;
}

function player1Cards (cards, canvas) {
    cards = cards.map(function (c) {
        return getCard(c, canvas);
    });

    var width = cardWidth() * scale (cardHeight(), canvas, cardFactor);
    for (var i=0; i<2; i++) {
        cards[i].position.x = view.center.x + width*(i/3-7);
        cards[i].position.y = view.center.y;
    }
}

function player2Cards (cards, canvas) {
    cards = cards.map(function (c) {
        return getCard(c, canvas);
    });

    var width = cardWidth() * scale (cardHeight(), canvas, cardFactor);
    for (var i=0; i<2; i++) {
        cards[i].position.x = view.center.x - width*(i/3-7);
        cards[i].position.y = view.center.y;
    }
}

function player1Bet (amt, canvas) {
    var m = scale(cardHeight(), canvas, cardFactor);
    var x = view.center.x + 5 * cardWidth() * m
    var y = view.center.y;
    var text = new PointText(new Point(x,y));
    betWidgets.push(text);
    text.fillColor = 'black';
    text.content = '$'+amt;

    var chip = new Raster("redChip");
    betWidgets.push(chip);
    var n = scale(chip.height, canvas, chipFactor);
    chip.scale(n);
    chip.position.x = view.center.x + 4 * cardWidth() * m;
    chip.position.y = y;
}

function player2Bet (amt, canvas) {
    var m = scale(cardHeight(), canvas, cardFactor);
    var x = view.center.x - 5 * cardWidth() * m
    var y = view.center.y;
    var text = new PointText(new Point(x,y));
    betWidgets.push(text);
    text.fillColor = 'black';
    text.content = '$'+amt;

    var chip = new Raster("redChip");
    betWidgets.push(chip);
    var n = scale(chip.height, canvas, chipFactor);
    chip.scale(n);
    chip.position.x = view.center.x - 3.5 * cardWidth() * m;
    chip.position.y = y;
}

function clearBets() {
    betWidgets.map(function (p) {p.remove()});
}

function init () {
    var canvas = document.getElementById("myCanvas");
    paper.setup(canvas);
    paper.install(window);
    var table = new Raster("table");
    var tableBounds = new Rectangle(0,0, canvas.width, canvas.height); 
    table.fitBounds(tableBounds);

    player1Cards(['Kh', 'Kd'], canvas);
    player2Cards(['FD', 'FD'], canvas);

    flop(['As','Ac','Ad'], canvas);
    turn('Ah', canvas);
    river('Ks', canvas);

    player1Bet(999, canvas);
    player2Bet(999, canvas);
    clearBets();
}


