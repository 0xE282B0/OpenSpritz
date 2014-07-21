/*
	Copyright 2014 Mark Bradshaw (mark.bradshaw@gmail.com), Joel Fouse (jfouse@gmail.com)
*/
(function() {
    var open_spritz = {};

    var internals = {
        position: 0,
        sentence_break: [],
        split_text: [],
        state: 'stopped',
        wpm: 250
    };

    /******** PUBLIC *********/

    open_spritz.assignElement = function(el) {
        internals.el = el;
    };

    open_spritz.setWPM = function(wpm) {
        if (wpm === 0) {
            return;
        }

        internals.wpm = wpm;
    };

    open_spritz.spritzify = function(text) {
        if (internals.el === undefined) {
            console.log('need an element');
            return;
        }

        if (text === '' || text === undefined) {
            console.log('need some text');
            return;
        }

        internals.text = text;
        internals.split_text = text.split(/\s+/);
        internals.sentence_break.length = 0;
        internals.position = 0;

        setTimeout(open_spritz.start, 1000);
    };

    open_spritz.onstart = function() {};

    open_spritz.start = function() {
        if (internals.state === 'running') {
            return;
        }

        internals.state = 'running';
        open_spritz.onstart();
        displayWord();
    };

    open_spritz.onstop = function() {};

    open_spritz.stop = function() {
        internals.state = 'stopped';
        open_spritz.onstop();
    };

    open_spritz.toggle = function() {
        if (internals.state === 'stopped') {
            open_spritz.start();
        } else {
            open_spritz.stop();
        }
    };

    open_spritz.getState = function (){
        return internals.state;
    };

    open_spritz.onupdate = function(){};

    open_spritz.getPosition = function() {
        return internals.position;
    };

    open_spritz.setPosition = function(position) {
        internals.position = position;
        if (position > internals.split_text.length - 1) {
            internals.position = internals.split_text.length - 1;
        }
    };

    open_spritz.getLength = function() {
        return internals.split_text.length;
    };

    /******* PRIVATE **********/

    function displayWord() {
        if (internals.state === 'stopped') {
            return;
        }

        if (internals.position >= internals.split_text.length) {
            internals.state = 'stopped';
            if (internals.onEnd !== undefined && typeof internals.onEnd === 'function') {
                internals.onEnd();
            }
            return;
        }

        var word = internals.split_text[internals.position++];
        var pivot = pivotLetter(word);

        var startPad = repeat('&nbsp;', 11 - pivot);
        var start = word.slice(0, pivot - 1);
        var letter = word.slice(pivot - 1, pivot);
        var end = word.slice(pivot, word.length);
        var endPad = repeat('&nbsp;', 11 - (word.length - pivot));

        internals.el.innerHTML = startPad + start + '<span class="spritz_pivot">' + letter + '</span>' + end + endPad;

        // standard delay
        var delay = 60 * 1000 / internals.wpm;

        var lastLetter = word.slice(word.length - 1);
        if ([',', ':'].indexOf(lastLetter) !== -1) {
            // delay += delay * 1.3;
        }

        // Looking for punction in the last two characters.  Could be !" or ?) or just . at the end.  We need a pause for that.
        if (word.length > 2) {
            var lastTwoLetters = word.slice(word.length - 2);
            if (['?', '!', '.', ';'].indexOf(lastTwoLetters) !== -1) {
                // delay += delay * 1.8;
                internals.sentence_break.push(internals.position - 1);
            }
        }
        open_spritz.onupdate();
        setTimeout(displayWord, delay);
    }

    function pivotLetter(word) {
        var bestLetter;
        switch (word.length) {
            case 1:
                bestLetter = 1; // first
                break;
            case 2:
            case 3:
            case 4:
            case 5:
                bestLetter = 2; // second
                break;
            case 6:
            case 7:
            case 8:
            case 9:
                bestLetter = 3; // third
                break;
            case 10:
            case 11:
            case 12:
            case 13:
                bestLetter = 4; // fourth
                break;
            default:
                bestLetter = 5; // fifth
        }

        return bestLetter;
    }

    function repeat(letter, num) {
        if (num < 1) {
            return new Array(Math.abs(num) + 1).join(letter);
        }
        return new Array(num + 1).join(letter);
    }

    window.open_spritz = open_spritz;
})();
