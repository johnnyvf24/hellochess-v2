'use strict';



var FourChess = function (fen) {
    var BOARD;

    /* jshint indent: false */
    var WHITE = 'w';
    var BLACK = 'b';
    var GOLD = 'g';
    var RED = 'r';

    var whiteOut = false;
    var blackOut = false;
    var goldOut = false;
    var redOut = false;
    
    var moveHistory = [];

    var numOut = 0;
    var nWhiteOut = 0;
    var nBlackOut = 0;
    var nGoldOut = 0;
    var nRedOut = 0;

    var TURN = WHITE;

    var EMPTY = -1;

    var PAWN = 'P';
    var KNIGHT = 'N';
    var BISHOP = 'B';
    var ROOK = 'R';
    var QUEEN = 'Q';
    var KING = 'K';

    var EMPTY = 0;

    var pgn = "";

    var SQUARE_STATUS = { EMPTY: 0,
        wP:  1, wN:  2, wB:  3, wR:  4, wQ:  5, wK:  6,
        bP:  7, bN:  8, bB:  9, bR: 10, bQ: 11, bK: 12,
        gP: 13, gN: 14, gB: 15, gR: 16, gQ: 17, gK: 18,
        rP: 19, rN: 20, rB: 21, rR: 22, rQ: 23, rK: 24,
    };

    var DEFAULT_POSITION = '3,bR,bN,bB,bK,bQ,bB,bN,bR,3/3,bP,bP,bP,bP,bP,bP,bP,bP,3/14/gR,gP,10,rP,rR/' +
        'gN,gP,10,rP,rN/gB,gP,10,rP,rB/gK,gP,10,rP,rQ/gQ,gP,10,rP,rK/gB,gP,10,rP,rB/' +
        'gN,gP,10,rP,rN/gR,gP,10,rP,rR/14/3,wP,wP,wP,wP,wP,wP,wP,wP,3/3,wR,wN,wB,wQ,wK,wB,wN,wR,3-w wr wl '+
        'gr gl br bl rr rl';

    var white_moved_king = false;
    var white_moved_rt = false;
    var white_moved_lt = false;
    var gold_moved_king = false;
    var gold_moved_rt = false;
    var gold_moved_lt = false;
    var black_moved_king = false;
    var black_moved_rt = false;
    var black_moved_lt = false;
    var red_moved_king = false;
    var red_moved_rt = false;
    var red_moved_lt = false;

    var RANK_1 = 13;
    var RANK_2 = 12;
    var RANK_3 = 11;
    var RANK_4 = 10;
    var RANK_5 = 9;
    var RANK_6 = 8;
    var RANK_7 = 7;
    var RANK_8 = 6;
    var RANK_9 = 5;
    var RANK_10 = 4;
    var RANK_11 = 3;
    var RANK_12 = 2;
    var RANK_13 = 1;
    var RANK_14 = 0;

    var FILES = 'abcdefghijklmn'.split('');

    var SQUARES = {
        a14:  0,  b14: 1,  c14: 2,  d14: 3,  e14: 4,  f14: 5,  g14: 6,  h14: 7,  i14: 8,  j14: 9,  k14: 10, l14: 11,  m14: 12, n14: 13,
        a13:  14, b13: 15, c13: 16, d13: 17, e13: 18, f13: 19, g13: 20, h13: 21, i13: 22, j13: 23, k13: 24, l13: 25,  m13: 26, n13: 27,
        a12:  28, b12: 29, c12: 30, d12: 31, e12: 32, f12: 33, g12: 34, h12: 35, i12: 36, j12: 37, k12: 38, l12: 39,  m12: 40, n12: 41,
        a11:  42, b11: 43, c11: 44, d11: 45, e11: 46, f11: 47, g11: 48, h11: 49, i11: 50, j11: 51, k11: 52, l11: 53,  m11: 54, n11: 55,
        a10:  56, b10: 57, c10: 58, d10: 59, e10: 60, f10: 61, g10: 62, h10: 63, i10: 64, j10: 65, k10: 66, l10: 67,  m10: 68, n10: 69,
        a9:   70, b9:  71, c9:  72, d9:  73, e9:  74, f9:  75, g9:  76, h9:  77, i9:  78, j9:  79, k9:  80, l9:  81,  m9:  82, n9:  83,
        a8:   84, b8:  85, c8:  86, d8:  87, e8:  88, f8:  89, g8:  90, h8:  91, i8:  92, j8:  93, k8:  94, l8:  95,  m8:  96, n8:  97,
        a7:   98, b7:  99, c7: 100, d7: 101, e7: 102, f7: 103, g7: 104, h7: 105, i7: 106, j7: 107, k7: 108, l7: 109,  m7: 110, n7: 111,
        a6:  112, b6: 113, c6: 114, d6: 115, e6: 116, f6: 117, g6: 118, h6: 119, i6: 120, j6: 121, k6: 122, l6: 123,  m6: 124, n6: 125,
        a5:  126, b5: 127, c5: 128, d5: 129, e5: 130, f5: 131, g5: 132, h5: 133, i5: 134, j5: 135, k5: 136, l5: 137,  m5: 138, n5: 139,
        a4:  140, b4: 141, c4: 142, d4: 143, e4: 144, f4: 145, g4: 146, h4: 147, i4: 148, j4: 149, k4: 150, l4: 151,  m4: 152, n4: 153,
        a3:  154, b3: 155, c3: 156, d3: 157, e3: 158, f3: 159, g3: 160, h3: 161, i3: 162, j3: 163, k3: 164, l3: 165,  m3: 166, n3: 167,
        a2:  168, b2: 169, c2: 170, d2: 171, e2: 172, f2: 173, g2: 174, h2: 175, i2: 176, j2: 177, k2: 178, l2: 179,  m2: 180, n2: 181,
        a1:  182, b1: 183, c1: 184, d1: 185, e1: 186, f1: 187, g1: 188, h1: 189, i1: 190, j1: 191, k1: 192, l1: 193,  m1: 194, n1: 195
    };

    function getKeyByValue(Object, value) {
        for(var prop in Object) {
            if(Object.hasOwnProperty(prop)) {
                if(Object[prop] === value) {
                    return prop;
                }
            }
        }
    }

    function clearBoard() {
        for(var i = 0; i < BOARD.length; i++) {
            BOARD[i] = 0;
        }
    }

    function stringInStringArray (str, strArray) {
        for (var j=0; j<strArray.length; j++) {
            if (strArray[j].match(str)) return true;
        }
        return false;
    }

    function generateFen() {
        var empty = 0;
        var fen = '';

        for(var i = 0; i < BOARD.length; i++) {
            if(BOARD[i] == 0) {
                empty++;
            } else {
                if (empty > 0) {
                    fen += empty + ',';
                    empty = 0;
                }
                fen += (getKeyByValue(SQUARE_STATUS, BOARD[i])) + ',';
            }


            if(i % 14 === 13) {
                if(empty > 0) {
                    fen += empty;
                }
                fen += '/';
                empty = 0;
            }

        }

        fen = fen.substring(0, fen.length - 1);

        fen = fen.replace(",/", "/")
        fen = fen.trim();

        //w wr wl gr gl br bl rr rl
        var otherInfo = '';
        otherInfo += TURN;

        //white castling permissions
        if(!white_moved_king) {
            if(!white_moved_rt) {
                otherInfo += ' wr';
            }
            if(!white_moved_lt) {
                otherInfo += ' wl';
            }
        }
        //gold castling permissions
        if(!gold_moved_king) {
            if(!gold_moved_rt) {
                otherInfo += ' gr';
            }
            if(!gold_moved_lt) {
                otherInfo += ' gl';
            }
        }
        //black castling permissions
        if(!black_moved_king) {
            if(!black_moved_rt) {
                otherInfo += ' br';
            }
            if(!black_moved_lt) {
                otherInfo += ' bl';
            }
        }

        if(!red_moved_king) {
            if(!red_moved_rt) {
                otherInfo += ' rr';
            }
            if(!red_moved_lt) {
                otherInfo += ' rl';
            }
        }

        if(whiteOut) {
            otherInfo += ' wo';
        }

        if(goldOut) {
            otherInfo += ' go';
        }

        if(blackOut) {
            otherInfo += ' bo';
        }

        if(redOut) {
            otherInfo += ' ro';
        }

        fen = fen + '-' + otherInfo;
        return fen;
    }

    var loadFen = function (fen) {
        var turnInfo = fen.split('-')[1];
        fen = fen.split('-')[0];
        fen = fen.replace(/ .+$/, '');
        var ranks = fen.split('/');

        var board = new Array(196);

        //Go through each rank
        var currentRow = 14;
        for(var i = 0; i < 14; i++) {
            var rank = ranks[i];
            var position = rank.split(',');
            var colIndex = 0;
            //Go through each column
            for(var j = 0; j < position.length; j++) {
                var piece = position[j];
                var isnum = /^\d+$/.test(piece);

                //free space
                if(isnum) {
                    var emptySquares = parseInt(piece, 10);
                    //Make x amount of empty squares
                    for(var k = 0; k < emptySquares; k++) {
                        var square = FILES[colIndex + k] + currentRow;
                        board[SQUARES[square]] = 0;
                    }

                    colIndex += emptySquares;
                }
                //a piece is on the square
                else {
                    var square = FILES[colIndex] + currentRow;
                    board[SQUARES[square]] = SQUARE_STATUS[piece];
                    colIndex++;
                }
            }

            currentRow--;
        }

        //parse other info
        TURN = turnInfo.charAt(0);
        turnInfo = turnInfo.split('-');

        //white
        if(stringInStringArray('wr', turnInfo)) {
            white_moved_rt = false;
            white_moved_king = false;
        } else {
            white_moved_rt = true;
        }
        if(stringInStringArray('wl', turnInfo)) {
            white_moved_lt = false;
            white_moved_king = false;
        } else {
            white_moved_lt = true;
        }

        //Gold
        if(stringInStringArray('gr', turnInfo)) {
            gold_moved_rt = false;
            gold_moved_king = false;
        } else {
            gold_moved_rt = true;
        }
        if(stringInStringArray('gl', turnInfo)) {
            gold_moved_lt = false;
            gold_moved_king = false;
        } else {
            gold_moved_lt = true;
        }

        //black
        if(stringInStringArray('br', turnInfo)) {
            black_moved_rt = false;
            black_moved_king = false;
        } else {
            black_moved_rt = true;
        }
        if(stringInStringArray('bl', turnInfo)) {
            black_moved_lt = false;
            black_moved_king = false;
        } else {
            black_moved_lt = true;
        }

        //red
        if(stringInStringArray('rr', turnInfo)) {
            red_moved_rt = false;
            red_moved_king = false;
        } else {
            red_moved_rt = true;
        }
        if(stringInStringArray('rl', turnInfo)) {
            red_moved_lt = false;
            red_moved_king = false;
        } else {
            red_moved_lt = true;
        }

        //keep track of who is out
        if(stringInStringArray('wo', turnInfo)) {
            whiteOut = true;
        }

        if(stringInStringArray('go', turnInfo)) {
            goldOut = true;
        }

        if(stringInStringArray('bo', turnInfo)) {
            blackOut = true;
        }

        if(stringInStringArray('ro', turnInfo)) {
            redOut = true;
        }

        return board;
    };

    BOARD = loadFen(DEFAULT_POSITION);

    function boardToStringRep() {
        var str = '';
        for(var i = 0; i < BOARD.length; i++) {
            str += (BOARD[i]) + ' ';
            if(i % 14 === 13) {
                str += '\n';
            }

        }
        console.log(str);
    }

    function printBoardState( state) {
        var str = '';
        for(var i = 0; i < state.length; i++) {
            str += (state[i]) + ' ';
            if(i % 14 === 13) {
                str += '\n';
            }

        }
        console.log(str);
    }

    function isSquareEmpty(square) {
        if(BOARD[SQUARES[square]] === EMPTY) {
            return true;
        }
        return false;
    }

    function whitePiece(piece) {
        if (piece < 7 && piece !== 0) {
            return true;
        }

        return false;
    }

    function blackPiece(piece) {
        if(piece > 6 && piece < 13) {
            return true;
        }
        return false;
    }

    function goldPiece(piece) {
        if(piece > 12 && piece < 19) {
            return true;
        }
        return false;
    }

    function redPiece(piece ) {
        if(piece > 18 && piece < 25) {
            return true;
        }
        return false;
    }

    function sameArmySquares(piece1, piece2) {
        if(whitePiece(piece1) && whitePiece(piece2)) {
            return true;
        }

        if(blackPiece(piece1) && blackPiece(piece2)) {
            return true;
        }

        if(goldPiece(piece1) && goldPiece(piece2)) {
            return true;
        }

        if(redPiece(piece1) && redPiece(piece2)) {
            return true;
        }
        return false;
    }

    function isSquareEnemy(startSquare, destSquare) {
        var type1 = BOARD[SQUARES[startSquare]];
        var type2 = BOARD[SQUARES[destSquare]];
        if(sameArmySquares(type1, type2)) {
            return false;
        }

        return true;
    }

    function isSquareValid(square) {
        var invalid_squares =[
                'a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3',     //bottom left
                'a14', 'b14', 'c14', 'a13', 'b13', 'c13', 'a12', 'b12', 'c12',   //top left
                'n14', 'm14', 'l14', 'n13', 'm13', 'l13', 'n12', 'm12', 'l12',  // top right
                'n1', 'n2', 'n3', 'm1', 'm2', 'm3', 'l1', 'l2', 'l3'];      //bottom right

        for(var i = 0; i < invalid_squares.length; i++) {
            if(square == invalid_squares[i]) {
                return false;
            }
        }

        return true;
    }

    function removeInvalidSquares(squares) {
        if(squares == null) {
            return;
        }
        var invalid_squares =[
                        'a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3',     //bottom left
                        'a14', 'b14', 'c14', 'a13', 'b13', 'c13', 'a12', 'b12', 'c12',   //top left
                        'n14', 'm14', 'l14', 'n13', 'm13', 'l13', 'n12', 'm12', 'l12',  // top right
                        'n1', 'n2', 'n3', 'm1', 'm2', 'm3', 'l1', 'l2', 'l3'];      //bottom right
        for(var i = 0; i < squares.length; i++) {
            for(var j = 0; j < invalid_squares.length; j++) {
                if(typeof squares[i] == 'undefined')  {
                    continue;
                }
                if(squares[i].to == invalid_squares[j]) {
                    squares.splice(i, 1);
                    i = 0;
                } else if(squares[i].to.search(/^[a-n][1-9][0-4]?$/) === -1) {
                    squares.splice(i, 1);
                    i = 0;
                }


            }
        }
        return squares;
    }

    function generateCastleMoves(toSquare, rank, alpha, color) {
        switch(color) {
            case 'w':
                if(white_moved_king || inCheck()) {
                    return;
                }
                var square1Right = String.fromCharCode(alpha.charCodeAt(0) + 1) + rank;
                var square2Right = String.fromCharCode(alpha.charCodeAt(0) + 2) + rank;

                var square1Left = String.fromCharCode(alpha.charCodeAt(0) - 1) + rank;
                var square2Left = String.fromCharCode(alpha.charCodeAt(0) - 2) + rank;
                var square3Left = String.fromCharCode(alpha.charCodeAt(0) - 3) + rank;

                if(isSquareEmpty(square1Right) && isSquareEmpty(square2Right)
                    && !white_moved_rt) {
                    toSquare.push( {'to': square2Right, 'castlerw': true});
                } else if(isSquareEmpty(square1Left) && isSquareEmpty(square2Left)
                        && isSquareEmpty(square3Left) && !white_moved_lt) {
                    toSquare.push( {'to': square2Left, 'castlelw': true});
                }
                break;
            case 'g':
                if(gold_moved_king || inCheck()) {
                    return;
                }
                var square1Right = alpha + (rank-1);
                var square2Right = alpha + (rank-2);
                var square3Right = alpha + (rank-3);

                var square1Left = alpha + (rank+1);
                var square2Left = alpha + (rank+2);

                if(isSquareEmpty(square1Right) && isSquareEmpty(square2Right)
                    && isSquareEmpty(square3Right) && !gold_moved_rt) {
                        toSquare.push( {'to': square2Right, 'castlerg': true});
                } else if(isSquareEmpty(square1Left) && isSquareEmpty(square2Left)
                    && !gold_moved_lt) {
                        toSquare.push( {'to': square2Left, 'castlelg': true});
                }

                break;
            case 'b':
                if(black_moved_king || inCheck()) {
                    return;
                }

                var square1Right = String.fromCharCode(alpha.charCodeAt(0) - 1) + rank;
                var square2Right = String.fromCharCode(alpha.charCodeAt(0) - 2) + rank;

                var square1Left = String.fromCharCode(alpha.charCodeAt(0) + 1) + rank;
                var square2Left = String.fromCharCode(alpha.charCodeAt(0) + 2) + rank;
                var square3Left = String.fromCharCode(alpha.charCodeAt(0) + 3) + rank;

                if(isSquareEmpty(square1Right) && isSquareEmpty(square2Right)
                    && !black_moved_rt) {
                        toSquare.push( {'to': square2Right, 'castlerb': true});
                } else if(isSquareEmpty(square1Left) && isSquareEmpty(square2Left)
                    && isSquareEmpty(square3Left) && !black_moved_lt) {
                        toSquare.push( {'to': square2Left, 'castlelb': true});
                }
                break;

            case 'r':
                if(red_moved_king || inCheck()) {
                    return;
                }
                var square1Right = alpha + (rank+1);
                var square2Right = alpha + (rank+2);
                var square3Right = alpha + (rank+3);

                var square1Left = alpha + (rank-1);
                var square2Left = alpha + (rank-2);

                if(isSquareEmpty(square1Right) && isSquareEmpty(square2Right)
                    && isSquareEmpty(square3Right) && !red_moved_rt) {
                        toSquare.push( {'to': square2Right, 'castlerr': true});
                } else if(isSquareEmpty(square1Left) && isSquareEmpty(square2Left)
                    && !red_moved_lt) {
                        toSquare.push( {'to': square2Left, 'castlelr': true});
                }
                break;
        }
    }

    function generateRankMoves(toSquare, rank, alpha, king) {
        var posSquaresInRank = (king) ? 1 : 14 - rank;
        //count the number of squares left before a piece hit
        for (var i = 1; i < posSquaresInRank + 1; i++) {
            var square = alpha + (rank + i);
            if(isSquareEmpty(square)) {
                toSquare.push({'to': square});
            } else {
                var startSquare = alpha + rank;
                if(isSquareEnemy(startSquare, square)) {
                    toSquare.push({'to': square});
                }
                break;  //a piece was found on this square
            }
        }

        var negSquaresInRank = (king) ? 1 : 14 + rank;
        for(var i = 1; i < negSquaresInRank + 1; i++) {
            var square = alpha + (rank - i);
            if (isSquareEmpty(square)) {
                toSquare.push({'to': square});
            } else {
                var startSquare = alpha + rank;
                if(isSquareEnemy(startSquare, square)) {
                    toSquare.push({'to': square});
                }
                break;
            }
        }
    }

    function generateFileMoves(toSquare, rank, alpha, king) {
        var posSquaresInFile = (king) ? 1 : 'n'.charCodeAt(0) - alpha.charCodeAt(0);
        for(var i = 1; i < posSquaresInFile + 1; i++) {
            var square = String.fromCharCode(alpha.charCodeAt(0) + i) + rank;
            if(isSquareEmpty(square)) {
                toSquare.push({'to': square});
            } else {
                var startSquare = alpha + rank;
                if(isSquareEnemy(startSquare, square)) {
                    toSquare.push({'to': square});
                }
                break;
            }
        }

        var negSquaresInFile = (king) ? 1 : alpha.charCodeAt(0) - 'a'.charCodeAt(0);
        for(var i = 1; i < negSquaresInFile + 1; i++) {
            var square = String.fromCharCode(alpha.charCodeAt(0) - i) + rank;
            if(isSquareEmpty(square)) {
                toSquare.push({'to': square});
            } else {
                var startSquare = alpha + rank;
                if(isSquareEnemy(startSquare, square)) {
                    toSquare.push({'to': square});
                }
                break;
            }
        }
    }

    function generateDiagnolMoves(toSquare, rank, alpha, king) {
        var posSquaresInDiagnol = (king) ? 1 : 'n'.charCodeAt(0) - alpha.charCodeAt(0);
        for(var i = 1; i < posSquaresInDiagnol + 1; i++) {
            var square = String.fromCharCode(alpha.charCodeAt(0) + i) + (rank + i);
            if(!isSquareValid(square)) {
                break;
            }
            else if(isSquareEmpty(square)) {
                toSquare.push({'to': square});
            } else {
                var startSquare = alpha + rank;
                if(isSquareEnemy(startSquare, square)) {
                    toSquare.push({'to': square});
                }
                break;
            }
        }

        var negSquaresInDiagnol = (king) ? 1 : alpha.charCodeAt(0) - 'a'.charCodeAt(0);
        for(var i = 1; i < negSquaresInDiagnol + 1; i++) {
            var square = String.fromCharCode(alpha.charCodeAt(0) - i) + (rank + i);
            if(!isSquareValid(square)) {
                break;
            }
            else if(isSquareEmpty(square)) {
                toSquare.push({'to': square});
            } else {
                var startSquare = alpha + rank;
                if(isSquareEnemy(startSquare, square)) {
                    toSquare.push({'to': square});
                }
                break;
            }
        }

        posSquaresInDiagnol = (king) ? 1 : 'n'.charCodeAt(0) - alpha.charCodeAt(0);
        for(var i = 1; i < posSquaresInDiagnol + 1; i++) {
            var square = String.fromCharCode(alpha.charCodeAt(0) + i) + (rank - i);
            if(!isSquareValid(square)) {
                break;
            }
            else if(isSquareEmpty(square)) {
                toSquare.push({'to': square});
            } else {
                var startSquare = alpha + rank;
                if(isSquareEnemy(startSquare, square)) {
                    toSquare.push({'to': square});
                }
                break;
            }
        }

        negSquaresInDiagnol = (king) ? 1 : alpha.charCodeAt(0) - 'a'.charCodeAt(0);
        for(var i = 1; i < negSquaresInDiagnol + 1; i++) {
            var square = String.fromCharCode(alpha.charCodeAt(0) - i) + (rank - i);
            if(!isSquareValid(square)) {
                break;
            }
            else if(isSquareEmpty(square)) {
                toSquare.push({'to': square});
            } else {
                var startSquare = alpha + rank;
                if(isSquareEnemy(startSquare, square)) {
                    toSquare.push({'to': square});
                }
                break;
            }
        }
    }

    function generateMovesForPiece(piece, alpha, rank, checkCastling = true) {
        var toSquare = [];
        var squaresToCheck = [];

        switch (piece) {
            case SQUARE_STATUS['wP']:
                if (rank === (RANK_13 + 1)) {
                    if(isSquareEmpty(alpha + (rank + 1))) {
                        squaresToCheck.push(alpha + (rank + 2));
                    }
                    //TODO empassant, maybe not?
                }

                /* Determine if pawn can capture */
                var cap1 = String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank + 1);
                var cap2 = String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank + 1);

                if(isSquareEnemy((alpha + rank), cap1) && !isSquareEmpty(cap1)) {
                    toSquare.push({'to': cap1});
                }
                if(isSquareEnemy((alpha + rank), cap2) && !isSquareEmpty(cap2)) {
                    toSquare.push({'to': cap2});
                }

                squaresToCheck.push(alpha + (rank + 1));
                for(var i = 0; i < squaresToCheck.length; i++) {
                    var square = squaresToCheck[i];
                    if(isSquareEmpty(square)) {
                        toSquare.push({'to': square});
                    }
                }
                break;
            case SQUARE_STATUS['bP']:
                if (rank === (RANK_2 + 1)) {
                    if(isSquareEmpty(alpha + (rank - 1))) {
                        squaresToCheck.push(alpha + (rank - 2));
                    }
                }

                /* Determine if pawn can capture */
                var cap1 = String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank - 1);
                var cap2 = String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank - 1);

                if(isSquareEnemy((alpha + rank), cap1) && !isSquareEmpty(cap1)) {
                    toSquare.push({'to': cap1});
                }
                if(isSquareEnemy((alpha + rank), cap2) && !isSquareEmpty(cap2)) {
                    toSquare.push({'to': cap2});
                }

                squaresToCheck.push(alpha + (rank - 1));
                for(var i = 0; i < squaresToCheck.length; i++) {
                    var square = squaresToCheck[i];
                    if(isSquareEmpty(square)) {
                        toSquare.push({'to': square});
                    }
                }
                break;
            case SQUARE_STATUS['gP']:

                if(alpha === 'b') {
                    if(isSquareEmpty('d' + rank) && isSquareEmpty('c' + rank)) {
                        squaresToCheck.push('d' + rank);
                    }
                }

                /* Determine if pawn can capture */
                var cap1 = String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank - 1);
                var cap2 = String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank + 1);

                if(isSquareEnemy((alpha + rank), cap1) && !isSquareEmpty(cap1)) {
                    toSquare.push({'to': cap1});
                }
                if(isSquareEnemy((alpha + rank), cap2) && !isSquareEmpty(cap2)) {
                    toSquare.push({'to': cap2});
                }

                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 1) + rank);

                for(var i = 0; i < squaresToCheck.length; i++) {
                    var square = squaresToCheck[i];
                    if(isSquareEmpty(square)) {
                        toSquare.push({'to': square});
                    }
                }
                break;
            case SQUARE_STATUS['rP']:
                if(alpha === 'm') {
                    if(isSquareEmpty('k' + rank) && isSquareEmpty('l' + rank)) {
                        squaresToCheck.push('k' + rank);
                    }
                }

                /* Determine if pawn can capture */
                var cap1 = String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank - 1);
                var cap2 = String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank + 1);

                if(isSquareEnemy((alpha + rank), cap1) && !isSquareEmpty(cap1)) {
                    toSquare.push({'to': cap1});
                }
                if(isSquareEnemy((alpha + rank), cap2) && !isSquareEmpty(cap2)) {
                    toSquare.push({'to': cap2});
                }

                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 1) + rank);
                for(var i = 0; i < squaresToCheck.length; i++) {
                    var square = squaresToCheck[i];
                    if(isSquareEmpty(square)) {
                        toSquare.push({'to': square});
                    }
                }
                break;
            case SQUARE_STATUS['wR']:
                generateRankMoves(toSquare, rank, alpha, false);
                generateFileMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['wN']:
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 2) + (rank + 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 2) + (rank + 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank + 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank + 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 2) + (rank - 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 2) + (rank - 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank - 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank - 2));
                for(var i = 0; i < squaresToCheck.length; i++) {
                    var square = squaresToCheck[i];
                    if(isSquareEmpty(square) && isSquareValid(square)) {
                        toSquare.push({'to': square});
                    }
                    else if(isSquareEnemy(alpha + rank, square)) {
                        toSquare.push({'to': square});
                    }
                }
                break;
            case SQUARE_STATUS['wB']:
                generateDiagnolMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['wQ']:
                generateRankMoves(toSquare, rank, alpha, false);
                generateFileMoves(toSquare, rank, alpha, false);
                generateDiagnolMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['wK']:
                generateRankMoves(toSquare, rank, alpha, true);
                generateFileMoves(toSquare, rank, alpha, true);
                generateDiagnolMoves(toSquare, rank, alpha, true);
                if (checkCastling === true) {
                    generateCastleMoves(toSquare, rank, alpha, 'w');
                }
                break;
            case SQUARE_STATUS['bR']:
                generateFileMoves(toSquare, rank, alpha, false);
                generateRankMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['bN']:
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 2) + (rank + 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 2) + (rank + 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank + 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank + 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 2) + (rank - 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 2) + (rank - 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank - 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank - 2));
                for(var i = 0; i < squaresToCheck.length; i++) {
                    var square = squaresToCheck[i];
                    if(isSquareEmpty(square) && isSquareValid(square)) {
                        toSquare.push({'to': square});
                    }
                    else if(isSquareEnemy(alpha + rank, square)) {
                        toSquare.push({'to': square});
                    }
                }
                break;
            case SQUARE_STATUS['bB']:
                generateDiagnolMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['bQ']:
                generateRankMoves(toSquare, rank, alpha, false);
                generateFileMoves(toSquare, rank, alpha, false);
                generateDiagnolMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['bK']:
                generateRankMoves(toSquare, rank, alpha, true);
                generateFileMoves(toSquare, rank, alpha, true);
                generateDiagnolMoves(toSquare, rank, alpha, true);
                if (checkCastling === true) {
                    generateCastleMoves(toSquare, rank, alpha, 'b');
                }
                break;
            case SQUARE_STATUS['gR']:
                generateRankMoves(toSquare, rank, alpha, false);
                generateFileMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['gN']:
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 2) + (rank + 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 2) + (rank + 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank + 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank + 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 2) + (rank - 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 2) + (rank - 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank - 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank - 2));
                for(var i = 0; i < squaresToCheck.length; i++) {
                    var square = squaresToCheck[i];
                    if(isSquareEmpty(square) && isSquareValid(square)) {
                        toSquare.push({'to': square});
                    } else if(isSquareEnemy(alpha + rank, square)) {
                        toSquare.push({'to': square});
                    }
                }
                break;
            case SQUARE_STATUS['gB']:
                generateDiagnolMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['gQ']:
                generateRankMoves(toSquare, rank, alpha, false);
                generateFileMoves(toSquare, rank, alpha, false);
                generateDiagnolMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['gK']:
                generateRankMoves(toSquare, rank, alpha, true);
                generateFileMoves(toSquare, rank, alpha, true);
                generateDiagnolMoves(toSquare, rank, alpha, true);
                if (checkCastling === true) {
                    generateCastleMoves(toSquare, rank, alpha, 'g');
                }
                break;
            case SQUARE_STATUS['rR']:
                generateRankMoves(toSquare, rank, alpha, false);
                generateFileMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['rN']:
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 2) + (rank + 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 2) + (rank + 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank + 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank + 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 2) + (rank - 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 2) + (rank - 1));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) + 1) + (rank - 2));
                squaresToCheck.push(String.fromCharCode(alpha.charCodeAt(0) - 1) + (rank - 2));
                for(var i = 0; i < squaresToCheck.length; i++) {
                    var square = squaresToCheck[i];
                    if(isSquareEmpty(square) && isSquareValid(square)) {
                        toSquare.push({'to': square});
                    } else if(isSquareEnemy(alpha + rank, square)) {
                        toSquare.push({'to': square});
                    }
                }
                break;
            case SQUARE_STATUS['rB']:
                generateDiagnolMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['rQ']:
                generateRankMoves(toSquare, rank, alpha, false);
                generateFileMoves(toSquare, rank, alpha, false);
                generateDiagnolMoves(toSquare, rank, alpha, false);
                break;
            case SQUARE_STATUS['rK']:
                generateRankMoves(toSquare, rank, alpha, true);
                generateFileMoves(toSquare, rank, alpha, true);
                generateDiagnolMoves(toSquare, rank, alpha, true);
                if (checkCastling === true) {
                    generateCastleMoves(toSquare, rank, alpha, 'r');
                }
                break;
        }
        if(toSquare.length == 0) {
            return null;
        } else {
            toSquare = removeInvalidSquares(toSquare);
            if(toSquare.length == 0) {
                return null;
            }
        }
        return toSquare;
    }

    function generateMovesForSquare(square, castling = true) {
        var alpha = square.charAt(0);
        if(square.length === 2)
            var rank = parseInt(square.charAt(1), 10);
        else if(square.length === 3) {
            var rank = parseInt(square.charAt(1) + square.charAt(2), 10);
        }

        var piece = BOARD[SQUARES[square]];

        return generateMovesForPiece(piece, alpha, rank, castling);
    }

    function calculateSquareFromIndex(index) {
        return String.fromCharCode('a'.charCodeAt(0) + (index % 14)) + ( 14 - Math.floor(index/14));
    }

    function kickWhiteOutOfGame() {
        var squares = [];
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            if(whitePiece(piece)) {
                BOARD[i] = EMPTY;
                squares.push(calculateSquareFromIndex(i));
            }
        }

        whiteOut = true;
        return squares;
    }

    function kickBlackOutOfGame() {
        var squares = [];
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            if(blackPiece(piece)) {
                BOARD[i] = EMPTY;
                squares.push(calculateSquareFromIndex(i));
            }
        }
        blackOut = true;
        return squares;
    }

    function kickGoldOutOfGame() {
        var squares = [];
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            if(goldPiece(piece)) {
                BOARD[i] = EMPTY;
                squares.push(calculateSquareFromIndex(i));
            }
        };
        goldOut = true;
        return squares;
    }

    function kickRedOutOfGame() {
        var squares = [];
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            if(redPiece(piece)) {
                BOARD[i] = EMPTY;
                squares.push(calculateSquareFromIndex(i));
            }
        }
        redOut = true;
        return squares;
    }

    function inCheckMate() {
        var squares = [];
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            switch(TURN) {
                case WHITE:
                    if(whitePiece(piece)) {
                        squares.push(calculateSquareFromIndex(i));
                    }
                    break;
                case BLACK:
                    if(blackPiece(piece)) {
                        squares.push(calculateSquareFromIndex(i));
                    }
                    break;
                case GOLD:
                    if(goldPiece(piece)) {
                        squares.push(calculateSquareFromIndex(i));
                    }
                    break;
                case RED:
                    if(redPiece(piece)) {
                        squares.push(calculateSquareFromIndex(i));
                    }
                    break;
            }
        }

        var invalid_squares =[
            'a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3',     //bottom left
            'a14', 'b14', 'c14', 'a13', 'b13', 'c13', 'a12', 'b12', 'c12',   //top left
            'n14', 'm14', 'l14', 'n13', 'm13', 'l13', 'n12', 'm12', 'l12',  // top right
            'n1', 'n2', 'n3', 'm1', 'm2', 'm3', 'l1', 'l2', 'l3'];      //bottom right

        for(var i = 0; i < squares.length; i++) {
            for(var j = 0; j < invalid_squares.length; j++) {
                if(squares[i].to == invalid_squares[j]) {
                    squares.splice(i, 1);
                    i = 0;
                }
            }
        }

        var BOARD_COPY = BOARD.slice();
        for(var i = 0; i < squares.length; i++) {
            var moves = generateMovesForSquare(squares[i]);
            if(moves !== null) {
                for(var j = 0; j < moves.length; j++) {
                    var square = moves[j].to;

                    //Make the move
                    var piece = BOARD[SQUARES[squares[i]]];
                    BOARD[SQUARES[squares[i]]] = EMPTY;
                    BOARD[SQUARES[square]] = piece;

                    var checked = inCheck();

                    if(!checked) {
                        BOARD = BOARD_COPY.slice(); //Reset the board
                        return false;
                    }
                    BOARD = BOARD_COPY.slice(); //Reset the board
                }
            }
        }

        return true;
    }


    function inCheck(color) {
        var currentKing = "";
        switch(TURN) {
            case 'w':
                currentKing = 'wK';
                break;
            case 'b':
                currentKing = 'bK';
                break;
            case 'g':
                currentKing = 'gK';
                break;
            case 'r':
                currentKing = 'rK';
                break;
        }
        //Find the king's square
        var kingSquare;
        for(var i = 0; i < BOARD.length; i++) {
            if(BOARD[i] == SQUARE_STATUS[currentKing]) {
                kingSquare = getKeyByValue(SQUARES, i);
            }
        }

        for(var i = 0; i < BOARD.length; i++) {
            var currentSquare = getKeyByValue(SQUARES, i);
            var moves = generateMovesForSquare(currentSquare, false);
            if(moves == null) {
                continue;
            }
            for(var j = 0; j < moves.length; j++) {
                if(moves[j].to == kingSquare) {
                    return true;
                }
            }
        }

        return false;
    }
    
    function insufficentMaterial(color) {
        var count = 0;
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            switch(color) {
                case WHITE:
                    if (whitePiece(piece)) { count++; }
                case BLACK:
                    if (blackPiece(piece)) { count++; }
                case GOLD:
                    if (goldPiece(piece)) { count++; }
                case RED:
                    if (redPiece(piece)) { count++; }
                    break;
            }
            
        }
        if(count > 1) {
            return false;
        }
        
        return true;
    }

    function gameOver() {
        var counter = 0;
        if(whiteOut || insufficentMaterial(WHITE)) {
            counter++;
        }
        if(goldOut || insufficentMaterial(GOLD)) {
            counter++;
        }
        if(blackOut || insufficentMaterial(BLACK)) {
            counter++;
        }
        if(redOut || insufficentMaterial(RED)) {
            counter++;
        }

        if(counter > 2) {
            return true;
        }

        return false;
    }
    
    function setImmediateTurn() {
        //Set the new Turn
        var newTurnSet = false;

        //TODO FIX this! IT's a really crappy way of doing this
        if(!gameOver()) {
            while (!newTurnSet ) {
                switch (TURN) {
                    case WHITE:
                        TURN = GOLD;
                        newTurnSet = (goldOut) ? false : true;
                        break;
                    case BLACK:
                        TURN = RED;
                        newTurnSet = (redOut) ? false : true;
                        break;
                    case GOLD:
                        TURN = BLACK;
                        newTurnSet = (blackOut) ? false : true;
                        break;
                    case RED:
                        TURN = WHITE;
                        newTurnSet = (whiteOut) ? false : true;
                        break;
                }
            }
        }
    }

    function setNextTurn() {
        //Set the new Turn
        var newTurnSet = false;

        //TODO FIX this! IT's a really crappy way of doing this
        if(!gameOver()) {
            while (!newTurnSet ) {
                switch (TURN) {
                    case WHITE:
                        TURN = GOLD;
                        newTurnSet = (goldOut || inCheckMate()) ? false : true;
                        break;
                    case BLACK:
                        TURN = RED;
                        newTurnSet = (redOut || inCheckMate()) ? false : true;
                        break;
                    case GOLD:
                        TURN = BLACK;
                        newTurnSet = (blackOut || inCheckMate()) ? false : true;
                        break;
                    case RED:
                        TURN = WHITE;
                        newTurnSet = (whiteOut || inCheckMate()) ? false : true;
                        break;
                }
            }
        }
    }

    function getAllWhiteSquares() {
        var squares = [];
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            if(whitePiece(piece)) {
                squares.push(calculateSquareFromIndex(i));
            }
        }

        return squares;
    }

    function getAllBlackSquares() {
        var squares = [];
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            if(blackPiece(piece)) {
                squares.push(calculateSquareFromIndex(i));
            }
        }
        return squares;
    }

    function getAllGoldSquares() {
        var squares = [];
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            if(goldPiece(piece)) {
                squares.push(calculateSquareFromIndex(i));
            }
        }
        return squares;
    }

    function getAllRedSquares() {
        var squares = [];
        for(var i = 0; i < BOARD.length; i++) {
            var piece = BOARD[i];
            if(redPiece(piece)) {
                squares.push(calculateSquareFromIndex(i));
            }
        }
        return squares;
    }

    function evalWhite(state) {
        var sum = 0;
        for(var i = 0; i < state.length; i++) {
            var piece = state[i];
            if(whitePiece(piece)) {
                switch(piece) {
                    case SQUARE_STATUS['wP']:
                        sum+=1;
                        break;
                    case SQUARE_STATUS['wR']:
                        sum+=6;
                        break;
                    case SQUARE_STATUS['wB']:
                        sum+=5;
                        break;
                    case SQUARE_STATUS['wQ']:
                        sum+=3;
                        break;
                    case SQUARE_STATUS['wK']:
                        sum+=5;
                        break;
                }
            }
        }

        return sum;
    }

    function evalBlack(state) {
        var sum = 0;
        for(var i = 0; i < state.length; i++) {
            var piece = state[i];
            if(blackPiece(piece)) {
                switch(piece) {
                    case SQUARE_STATUS['bP']:
                        sum+=1;
                        break;
                    case SQUARE_STATUS['bR']:
                        sum+=6;
                        break;
                    case SQUARE_STATUS['bB']:
                        sum+=5;
                        break;
                    case SQUARE_STATUS['bQ']:
                        sum+=3;
                        break;
                    case SQUARE_STATUS['bK']:
                        sum+=5;
                        break;
                }
            }
        }
        return sum;
    }

    function evalGold(state) {
        var sum = 0;
        for(var i = 0; i < state.length; i++) {
            var piece = state[i];
            if(goldPiece(piece)) {
                switch(piece) {
                    case SQUARE_STATUS['gP']:
                        sum+=1;
                        break;
                    case SQUARE_STATUS['gR']:
                        sum+=6;
                        break;
                    case SQUARE_STATUS['gB']:
                        sum+=5;
                        break;
                    case SQUARE_STATUS['gQ']:
                        sum+=3;
                        break;
                    case SQUARE_STATUS['gK']:
                        sum+=5;
                        break;
                }
            }
        }
        return sum;
    }

    function evalRed(state) {
        var sum = 0;
        for(var i = 0; i < state.length; i++) {
            var piece = state[i];
            if(redPiece(piece)) {
                switch(piece) {
                    case SQUARE_STATUS['rP']:
                        sum+=1;
                        break;
                    case SQUARE_STATUS['rR']:
                        sum+=6;
                        break;
                    case SQUARE_STATUS['rB']:
                        sum+=5;
                        break;
                    case SQUARE_STATUS['rQ']:
                        sum+=3;
                        break;
                    case SQUARE_STATUS['rK']:
                        sum+=5;
                        break;
                }
            }
        }
        return sum;
    }

    function attackedSquared(state, TURN) {
        // for(var i = 0 ;i < state.length; i++) {
        //     switch(TURN) {
        //         case 'w':

        //             break;
        //         case 'b':

        //             break;
        //         case 'g':

        //             break;
        //         case 'r':

        //             break;
        //     }
        // }

    }

    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }

    function evaluateState(state) {
        var points = 0;
        switch(TURN) {
            case 'w':
                points = evalWhite(state);
                points -= evalBlack(state);
                points -= evalGold(state);
                points -= evalRed(state);
                break;
            case 'b':
                points = evalBlack(state);
                points -= evalWhite(state);
                points -= evalGold(state);
                points -= evalRed(state);
                break;
            case 'g':
                points = evalGold(state);
                points -= evalBlack(state);
                points -= evalGold(state);
                points -= evalRed(state);
                break;
            case 'r':
                points = evalRed(state);
                points -= evalBlack(state);
                points -= evalGold(state);
                points -= evalWhite(state);
                break;
        }

        // points += attackedSquared(state, TURN);

        return points;
    }

    function moveState(board, move) {
        var piece = board[SQUARES[move.from]];
        board[SQUARES[move.from]] = EMPTY;

        var status = new Object();

        //Was a king taken?
        switch(board[SQUARES[move.to]]) {
            case SQUARE_STATUS['wK']:
                board[SQUARES[move.to]] = piece;
                // status.opponentOut = kickWhiteOutOfGame();
                break;
            case SQUARE_STATUS['bK']:
                board[SQUARES[move.to]] = piece;
                // status.opponentOut = kickBlackOutOfGame();
                break;
            case SQUARE_STATUS['gK']:
                board[SQUARES[move.to]] = piece;
                // status.opponentOut = kickGoldOutOfGame();
                break;
            case SQUARE_STATUS['rK']:
                board[SQUARES[move.to]] = piece;
                // status.opponentOut = kickRedOutOfGame();
                break;
            default:
                board[SQUARES[move.to]] = piece;
        }

        return board;
    }

    function allMovesForState(state, turn) {
        var ORIGINAL = BOARD.slice();
        BOARD = state.slice();
        var ownedSquares = [];
        switch(turn) {
            case 'w':
                ownedSquares = getAllWhiteSquares();
                break;
            case 'b':
                ownedSquares = getAllBlackSquares();
                break;
            case 'g':
                ownedSquares = getAllGoldSquares();
                break;
            case 'r':
                ownedSquares = getAllRedSquares();
                break;
        }
        var moves = [];
        for(var i = 0; i < ownedSquares.length; i++) {
            var temp = generateMovesForSquare(ownedSquares[i]);
            temp = removeInvalidSquares(temp);
            if(temp != null) {
                var BOARD_COPY = BOARD.slice();
                for(var j = 0; j < temp.length; j++) {
                    temp[j].from = ownedSquares[i];

                    //make the move
                    var piece = BOARD[SQUARES[ownedSquares[i]]];
                    BOARD[SQUARES[ownedSquares[i]]] = EMPTY;
                    BOARD[SQUARES[temp[j].to]] = piece;

                    var checked = inCheck();

                    if(checked) {
                        temp.splice(j, 1);
                        j= -1;  //restart traversal
                    } else {
                        moves.push(temp[j]);
                    }

                    BOARD = BOARD_COPY.slice();
                }
            }
        }

        var validMoves = [];
        //only get the valid moves
        for(var i = 0; i < moves.length; i++) {
            validMoves.push(moves[i]);
        }

        BOARD = ORIGINAL;
        return validMoves;
    }

    function maximum(val1, val2) {
        if(val1 > val2) {
            return val1;
        } else {
            return val2;
        }
    }

    function minimum(val1, val2) {
        if(val1 <= val2) {
            return val1;
        } else {
            return val2;
        }
    }

    function orderMoves(moves, state) {
        var betterMoves = [];
        var worseMoves = [];
        for(var i = 0; i < moves.length; i++) {
            if(typeof moves[i] === 'undefined') {
                continue;
            }


            var pieceFrom = state[SQUARES[moves[i].from]];
            var pieceFromName = getKeyByValue(SQUARE_STATUS, pieceFrom);
            var pieceFromType = pieceFromName.charAt(1);

            var pointsFrom = 0;
            switch(pieceFromType) {
                case 'P':
                    pointsFrom = 1;
                    break;
                case 'N':
                    pointsFrom = 3;
                    break;
                case 'R':
                    pointsFrom = 6;
                    break;
                case 'B':
                    pointsFrom = 5;
                    break;
                case 'K':
                    pointsFrom = 1;
                    break;
                case 'Q':
                    pointsFrom = 10;
                    break;
            }

            var pieceDest = state[SQUARES[moves[i].to]];
            var pieceDestName = getKeyByValue(SQUARE_STATUS, pieceDest);
            if(pieceDestName == 'EMPTY') {
                worseMoves.push(moves[i]);
                moves.splice(i, 1);
            }
            var pieceDestType = pieceDestName.charAt(1);

            var pointsDest = 0;
            switch(pieceDestType) {
                case 'P':
                    pointsDest = 1;
                    break;
                case 'N':
                    pointsDest = 3;
                    break;
                case 'R':
                    pointsDest = 6;
                    break;
                case 'B':
                    pointsDest = 5;
                    break;
                case 'K':
                    pointsDest = 1;
                    break;
                case 'Q':
                    pointsDest = 10;
                    break;
            }
            if(pointsDest == 0) {
                continue;
            }

            if(pointsDest <= pointsFrom){
                betterMoves.push(moves[i]);
                moves.splice(i, 1);
            } else {
                worseMoves.push(moves[i]);
                moves.splice(i, 1);
            }
        }

        moves = betterMoves.concat(moves);
        moves = moves.concat(worseMoves);
        return moves;
    }
    
    function getWinColor() {
        if(goldOut && blackOut && redOut) {
            return 'w';
        } else if(blackOut && redOut && whiteOut) {
            return 'g';
        } else if(redOut && whiteOut && goldOut) {
            return 'b';
        } else if(whiteOut && goldOut && blackOut) {
            return 'r';
        } else {
            return null;
        }
    }
    
    function getRemainingPlayers() {
        var remaining =[];
        if (!whiteOut) {
            remaining.push(WHITE);
        }
        
        if (!blackOut) {
            remaining.push(BLACK);
        }
        
        if (!goldOut) {
            remaining.push(GOLD);
        }
        
        if (!redOut) {
            remaining.push(RED);
        }
        
        return remaining;
    }

    function search(state, alpha, beta, depth, maximizingPlayer) {
        if(depth == 0) {
            var value = evaluateState(state);
            return {v: value };
        } else {
            var stateCopy;
            var moves;


            // moves = moveOrdering(moves, state);
            if(!maximizingPlayer) {
                switch(TURN) {
                    case 'w':
                        moves = allMovesForState(state, 'b');
                        moves = moves.concat(allMovesForState(state, 'g'));
                        moves = moves.concat(allMovesForState(state, 'r'));
                        break;
                    case 'b':
                        moves = allMovesForState(state, 'w');
                        moves = moves.concat(allMovesForState(state, 'g'));
                        moves = moves.concat(allMovesForState(state, 'r'));
                        break;
                    case 'g':
                        moves = allMovesForState(state, 'b');
                        moves = moves.concat(allMovesForState(state, 'w'));
                        moves = moves.concat(allMovesForState(state, 'r'));
                        break;
                    case 'r':
                        moves = allMovesForState(state, 'b');
                        moves = moves.concat(allMovesForState(state, 'g'));
                        moves = moves.concat(allMovesForState(state, 'w'));
                        break;
                }

                moves = orderMoves(moves, state);

                //minimize
                var min = 1000000;
                var move = null;
                for(var i = 0; i < moves.length; i++) {
                    stateCopy = state.slice();

                    //make the move
                    stateCopy = moveState(stateCopy, moves[i]);
                    var childMin = search(stateCopy, alpha, beta, depth-1, true).v;
                    if(min >= childMin) {
                        min = childMin;
                        move = moves[i];
                    }

                    beta = minimum(beta, min);

                    if(beta <= alpha) {
                        break;
                    }
                }
                return {v: min, move: move};
            } else {
                //maximize
                moves = allMovesForState(state, TURN);
                moves = shuffle(moves);
                moves = orderMoves(moves, state);
                var max = -1000000;
                var move = null;
                for(var i = 0; i < moves.length; i++) {
                    stateCopy = state.slice();
                    //make the move
                    stateCopy = moveState(stateCopy, moves[i]);
                    var childMax = search(stateCopy, alpha, beta, depth-1, false).v;
                    if(childMax >= max) {
                        max = childMax;
                        move = moves[i];
                    }

                    alpha = maximum(alpha, max);

                    if(beta <= alpha) {
                        console.log("broken");
                        break;
                    }
                }

                return {v: max, move: move};
            }
        }
    }

    return {

        /** Public API **/
        pgn: function() {
            return pgn;
        },
        fen: function() {
            return generateFen();
        },
        position: function(fen) {
            BOARD=loadFen(fen);
        },
        allMoves: function() {
            var ownedSquares = [];
            switch(TURN) {
                case 'w':
                    ownedSquares = getAllWhiteSquares();
                    break;
                case 'b':
                    ownedSquares = getAllBlackSquares();
                    break;
                case 'g':
                    ownedSquares = getAllGoldSquares();
                    break;
                case 'r':
                    ownedSquares = getAllRedSquares();
                    break;
            }

            var moves = [];
            for(var i = 0; i < ownedSquares.length; i++) {
                var temp = generateMovesForSquare(ownedSquares[i]);
                if(temp != null) {
                    var BOARD_COPY = BOARD.slice();
                    for(var j = 0; j < temp.length; j++) {
                        temp[j].from = ownedSquares[i];

                        //make the move
                        var piece = BOARD[SQUARES[ownedSquares[i]]];
                        BOARD[SQUARES[ownedSquares[i]]] = EMPTY;
                        BOARD[SQUARES[temp[j].to]] = piece;

                        var checked = inCheck();

                        if(checked) {
                            temp.splice(j, 1);
                            j= -1;  //restart traversal
                        } else {
                            moves.push(temp[j]);
                        }

                        BOARD = BOARD_COPY.slice();
                    }
                }
            }

            moves = removeInvalidSquares(moves);

            var validMoves = [];
            //only get the valid moves
            for(var i = 0; i < moves.length; i++) {
                validMoves.push(moves[i]);
            }

            return validMoves;
        },
        moves: function (options) {
            var moves = generateMovesForSquare(options.square);
            if(moves == null) {
                return moves;
            }
            var BOARD_COPY = BOARD.slice();
            for(var i =0 ;i < moves.length; i++) {

                //make the move
                var piece = BOARD[SQUARES[options.square]];
                BOARD[SQUARES[options.square]] = EMPTY;
                BOARD[SQUARES[moves[i].to]] = piece;

                var checked = inCheck();

                if(checked) {
                    moves.splice(i, 1);
                    i= -1;  //restart traversal
                }

                BOARD = BOARD_COPY.slice();
            }

            return moves;
        },
        move: function(move) {
            if(move == undefined) {
                return;
            }
            if (move.piece && move.piece.charAt(0).toLowerCase() !== TURN) {
                return null;
            }
            
            if(inCheckMate()) {
                setImmediateTurn();
            }
            
            if(move.color) {
                TURN = move.color;
            }
            
            // make sure the piece that is being moved is
            // on the correct square
            if (move.piece && SQUARE_STATUS[move.piece] !== BOARD[SQUARES[move.from]]) {
                return null;
            }
            var options = generateMovesForSquare(move.from);
            if(options == null) {
                return null;
            }

            var invalid = false

            //Make sure the king doesn't get into check, make a copy of the original state
            var BOARD_COPY = BOARD.slice();

            //make the move
            var piece = BOARD[SQUARES[move.from]];
            BOARD[SQUARES[move.from]] = EMPTY;
            BOARD[SQUARES[move.to]] = piece;

            //Check to see if the player is in check
            var checked = inCheck();

            if(checked) {
                invalid = true;
            }

            BOARD = BOARD_COPY.slice();

            if(invalid) {
                return null;
            }

            for(var i = 0; i < options.length; i++) {
                if(options[i].to === move.to) { //this was a valid move
                    var piece = BOARD[SQUARES[move.from]];
                    BOARD[SQUARES[move.from]] = EMPTY;
                    
                    var moveString = TURN + ":" + move.from + "-" + move.to;
                    
                    pgn += moveString + " ";

                    //a castle occurred
                    if(options[i].castlerw) {
                        BOARD[SQUARES.k1] = EMPTY;
                        BOARD[SQUARES.i1] = SQUARE_STATUS.wR;
                    } else if(options[i].castlelw) {
                        BOARD[SQUARES.d1] = EMPTY;
                        BOARD[SQUARES.g1] = SQUARE_STATUS.wR;
                    } else if(options[i].castlerg) {
                        BOARD[SQUARES.a4] = EMPTY;
                        BOARD[SQUARES.a7] = SQUARE_STATUS.gR;
                    } else if(options[i].castlelg) {
                        BOARD[SQUARES.a11] = EMPTY;
                        BOARD[SQUARES.a9] = SQUARE_STATUS.gR;
                    } else if(options[i].castlerb) {
                        BOARD[SQUARES.d14] = EMPTY;
                        BOARD[SQUARES.f14] = SQUARE_STATUS.bR;
                    } else if(options[i].castlelb) {
                        BOARD[SQUARES.k14] = EMPTY;
                        BOARD[SQUARES.h14] = SQUARE_STATUS.bR;
                    } else if(options[i].castlerr) {
                        BOARD[SQUARES.n11] = EMPTY;
                        BOARD[SQUARES.n8] = SQUARE_STATUS.rR;
                    } else if(options[i].castlelr) {
                        BOARD[SQUARES.n4] = EMPTY;
                        BOARD[SQUARES.n6] = SQUARE_STATUS.rR;
                    }

                    //Keep track of moved rooks
                    if(move.from == 'k1') {
                        white_moved_rt = true;
                    } else if(move.from == 'd1') {
                        white_moved_lt = true;
                    } else if(move.from == 'a4') {
                        gold_moved_rt = true;
                    } else if(move.from == 'a11') {
                        gold_moved_lt = true;
                    } else if(move.from == 'd14') {
                        black_moved_rt = true;
                    } else if(move.from == 'k14') {
                        black_moved_lt = true;
                    } else if(move.from == 'n4') {
                        red_moved_lt = true;
                    } else if(move.from == 'n11') {
                        red_moved_rt = true;
                    }

                    //Pawn Promotions
                    switch(piece) {
                        case SQUARE_STATUS['wP']:
                            if(move.to.charAt(1) == '1' && move.to.charAt(2)  && move.to.charAt(2) == '1') {
                                piece = SQUARE_STATUS['wQ']; //auto queen
                            }
                            break;
                        case SQUARE_STATUS['wK']:
                            white_moved_king = true;
                            break;
                        case SQUARE_STATUS['bK']:
                            black_moved_king = true;
                            break;
                        case SQUARE_STATUS['gK']:
                            gold_moved_king = true;
                            break;
                        case SQUARE_STATUS['rK']:
                            red_moved_king = true;
                            break;
                        case SQUARE_STATUS['bP']:
                            if(move.to.charAt(1) == '4') {
                                piece = SQUARE_STATUS['bQ']; //auto queen
                            }
                            break;
                        case SQUARE_STATUS['gP']:
                            if(move.to.charAt(0) == 'k') {
                                piece = SQUARE_STATUS['gQ']; //auto queen
                            }
                            break;
                        case SQUARE_STATUS['rP']:
                            if(move.to.charAt(0) == 'd') {
                                piece = SQUARE_STATUS['rQ']; //auto queen
                            }
                            break;
                    }

                    var status = new Object();

                    //Was a king taken?
                    switch(BOARD[SQUARES[move.to]]) {
                        case SQUARE_STATUS['wK']:
                            BOARD[SQUARES[move.to]] = piece;
                            // status.opponentOut = kickWhiteOutOfGame();
                            if(whiteOut === false) {
                                numOut++;
                                whiteOut = true;
                                nWhiteOut = numOut;
                                status.color = 'w';
                            }
                            break;
                        case SQUARE_STATUS['bK']:
                            BOARD[SQUARES[move.to]] = piece;
                            // status.opponentOut = kickBlackOutOfGame();
                            if(blackOut === false) {
                                numOut++;
                                blackOut = true;
                                nBlackOut = numOut;
                                status.color = 'b';
                            }
                            break;
                        case SQUARE_STATUS['gK']:
                            BOARD[SQUARES[move.to]] = piece;
                            // status.opponentOut = kickGoldOutOfGame();
                            if(goldOut === false) {
                                numOut++;
                                goldOut = true;
                                nGoldOut = numOut;
                                status.color = 'g';
                            }
                            break;
                        case SQUARE_STATUS['rK']:
                            BOARD[SQUARES[move.to]] = piece;
                            // status.opponentOut = kickRedOutOfGame();
                            if(redOut === false) {
                                numOut++;
                                redOut = true;
                                nRedOut = numOut;
                                status.color = 'r';
                            }
                            break;
                        default:
                            BOARD[SQUARES[move.to]] = piece;
                    }
                    
                    moveHistory.push({
                       color: TURN,
                       san: move.from + '-' + move.to,
                       from: move.from,
                       to: move.to,
                       fen: generateFen()
                    });
                    
                    setImmediateTurn();
                    
                    // setNextTurn();

                    status.turn = TURN;
                    

                    return status;
                }
            }
            return null;
        },
        in_draw: function() {
            var remainingPlayers = getRemainingPlayers();
            if(remainingPlayers.length === 1) {
                return false;
            } else {
                for(var i = 0; i < remainingPlayers.length; i++) {
                    if (insufficentMaterial(remainingPlayers[i]) === false) {
                        return false;
                    }
                }
                return true;
            }
            
        },
        turn: function() {
            return TURN;
        },
        game_over: function() {
            return gameOver();
        },
        history: function() {
            return moveHistory;
        },
        reset: function() {
            loadFen(DEFAULT_POSITION);
            TURN= WHITE;
            whiteOut = false;
            blackOut = false;
            goldOut = false;
            redOut = false;
            moveHistory = [];
        },
        getPieceCount: function() {
            var count = 0;
            for(var i = 0; i < BOARD.length; i++) {
                if(BOARD[i] != EMPTY) {
                    count++;
                }
            }
            return count;
        },

        kickWhite: function() {
            return kickWhiteOutOfGame();
        },
        kickBlack: function() {
            return kickBlackOutOfGame();
        },
        kickGold: function() {
            return kickGoldOutOfGame();
        },
        kickRed: function () {
            return kickRedOutOfGame();
        },
        setWhiteOut: function() {
            if(whiteOut === false) {
                numOut++;
                whiteOut = true;
                nWhiteOut = numOut;   
            }
        },
        setGoldOut: function() {
            if(goldOut === false) {
                numOut++;
                goldOut = true;
                nGoldOut = numOut;
            }
        },
        setBlackOut: function() {
            if(blackOut === false) {
                numOut++;
                blackOut = true;
                nBlackOut = numOut;
            }
        },
        setRedOut: function() {
            if(redOut === false) {
                numOut++;
                redOut = true;
                nRedOut = numOut;
            }
        },
        isWhiteOut: function() {
            return whiteOut;
        },
        isBlackOut: function() {
            return blackOut;
        },
        isGoldOut: function() {
            return goldOut;
        },
        isRedOut: function() {
            return redOut;
        },
        nextTurn: function() {
            setNextTurn();
        },
        printBoard: function() {
            boardToStringRep();
        },
        getLoserOrder: function() {
            let loserOrder =  {
                w: nWhiteOut,
                b: nBlackOut,
                g: nGoldOut,
                r: nRedOut
            };
            let winColor = getWinColor();
            if(winColor !== null) {
                loserOrder[winColor] = 4;
            }
            return loserOrder;
        },
        getWinnerColor: function() {
            return getWinColor();
        },
        inCheckMate: function() {
            return inCheckMate();
        },
        getBoard: function() {
            return BOARD;
        },
        getWhitePoints: function() {
            var sum = 0;
            for(var i = 0; i < BOARD.length; i++) {
                var piece = BOARD[i];
                if(whitePiece(piece)) {
                    sum++;
                }
            }
            return sum;
        },
        getBlackPoints: function() {
            var sum = 0;
            for(var i = 0; i < BOARD.length; i++) {
                var piece = BOARD[i];
                if(blackPiece(piece)) {
                    sum++;
                }
            }
            return sum;
        },
        getGoldPoints: function() {
            var sum = 0;
            for(var i = 0; i < BOARD.length; i++) {
                var piece = BOARD[i];
                if(goldPiece(piece)) {
                    sum++;
                }
            }
            return sum;
        },
        getRedPoints: function() {
            var sum = 0;
            for(var i = 0; i < BOARD.length; i++) {
                var piece = BOARD[i];
                if(redPiece(piece)) {
                    sum++;
                }
            }
            return sum;
        },

        set_turn: function(turn) {
            TURN = turn;
        },

        findMove: function(depth) {
            var move = search(BOARD.slice(), -1000000, 1000000, depth, true);
            console.log(move.v);
            return move.move;
        }

    };
};

/* export Chess object if using node or any other CommonJS compatible
 * environment */
if (typeof exports !== 'undefined') exports.FourChess = FourChess;
/* export Chess object for any RequireJS compatible environment */
if (typeof define !== 'undefined') define( function () { return FourChess;  });
