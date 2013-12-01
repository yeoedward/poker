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

function scalingFactor (height, canvas) {
    var factor = 6;
    return canvas.height/factor/height; 
}

function cardWidth () {
    return 79;
}

function cardHeight () {
    return 123;
}

function getCard (facedown, rank, suit, canvas) {
    var cards = new Raster("cards");
    cards.visible = false;
    var wd = cardWidth();
    var ht = cardHeight();
    var x,y;
    if (facedown) {
        x = 2*wd;
        y = 4*ht;
    } else {
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

    var rect = new Rectangle(x,y,wd,ht);
    var card = cards.getSubRaster(rect);
    card.scale(scalingFactor(cardHeight(), canvas));
    return card;
}


function flop (cards, canvas) {
    var flop = cards.map(function (c) {
        return getCard(false, toRank(c), toSuit(c), canvas);
    });

    var width = cardWidth() * scalingFactor(cardHeight(), canvas);
    for (var i=0; i<3; i++) {
        flop[i].position.x = view.center.x + width*(i-2);
        flop[i].position.y = view.center.y;
    }
}

function turn (c, canvas) {
    var card = getCard(false, toRank(c), toSuit(c), canvas);
    var width = cardWidth() * scalingFactor (cardHeight(), canvas);
    card.position.x = view.center.x + 1.25*width;
    card.position.y = view.center.y;
}

function river (c, canvas) {
    var card = getCard(false, toRank(c), toSuit(c), canvas);
    var width = cardWidth() * scalingFactor (cardHeight(), canvas);
    card.position.x = view.center.x + 2.5*width;
    card.position.y = view.center.y;
}

function player1Cards (facedown, cards, canvas) {
    cards = cards.map(function (c) {
        return getCard(facedown, toRank(c), toSuit(c), canvas);
    });

    var width = cardWidth() * scalingFactor (cardHeight(), canvas);
    for (var i=0; i<2; i++) {
        cards[i].position.x = view.center.x + width*(i/3-7);
        cards[i].position.y = view.center.y;
    }
}

function player2Cards (facedown, cards, canvas) {
    cards = cards.map(function (c) {
        return getCard(facedown, toRank(c), toSuit(c), canvas);
    });

    var width = cardWidth() * scalingFactor (cardHeight(), canvas);
    for (var i=0; i<2; i++) {
        cards[i].position.x = view.center.x - width*(i/3-7);
        cards[i].position.y = view.center.y;
    }
}

function player1Bet (amt, canvas) {
    var x = view.center.x + 5*cardWidth() * scalingFactor(cardHeight(), canvas);
    var y = view.center.y;
    var text = new PointText(new Point(x,y));
    text.fillColor = 'black';
    text.content = '$'+amt;
}

window.onload = function () {
    var canvas = document.getElementById("myCanvas");
    paper.setup(canvas);
    paper.install(window);

    var table = new Raster("table");
    var tableBounds = new Rectangle(0,0, canvas.width, canvas.height); 
    table.fitBounds(tableBounds);

    player1Cards(false, ['Kh', 'Kd'], canvas);
    player2Cards(true, ['As', 'As'], canvas);

    flop(['As','Ac','Ad'], canvas);
    turn('Ah', canvas);
    river('Ks', canvas);

    player1Bet(999, canvas);
}


