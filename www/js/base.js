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

function getCard (facedown, rank, suit, canvas) {
    var cards = new Raster("cards");
    cards.visible = false;
    var wd = 79;
    var ht = 123;
    var x,y;
    if (facedown) {
        x = 4*ht;
        y = 2*wd;
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
    card.scale(canvas.height/4/ht);
    return card;
}

function flop (cards, canvas) {
    var flop = [];
    for (var i=0; i<3; i++) {
        var c = cards[i];
        flop.push(getCard(false, toRank(c), toSuit(c), canvas));
    }

    var width = flop[0].width * (canvas.height/4/flop[0].height); 
    for (var i=0; i<3; i++) {
        flop[i].position.x = view.center.x + width*(i-2);
        flop[i].position.y = view.center.y;
    }
}

function turn (c, canvas) {
    var card = getCard(false, toRank(c), toSuit(c), canvas);
    var width = card.width * (canvas.height/4/card.height);
    card.position.x = view.center.x + 1.25*width;
    card.position.y = view.center.y;
}

function river (c, canvas) {
    var card = getCard(false, toRank(c), toSuit(c), canvas);
    var width = card.width * (canvas.height/4/card.height);
    card.position.x = view.center.x + 2.5*width;
    card.position.y = view.center.y;
}

window.onload = function () {
    var canvas = document.getElementById("myCanvas");
    paper.setup(canvas);
    paper.install(window);

    var table = new Raster("table");
    var tableBounds = new Rectangle(0,0, canvas.width, canvas.height); 
    table.fitBounds(tableBounds);

    flop(['As','Ac','Ad'], canvas);
    turn('Ah', canvas);
    river('Ks', canvas);
}
