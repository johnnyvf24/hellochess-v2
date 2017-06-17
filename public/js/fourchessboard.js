/*!
 * chessboard.js v0.3.0
 *
 * Copyright 2013 Chris Oakman
 * Released under the MIT license
 * http://chessboardjs.com/license
 *
 * Date: 10 Aug 2013
 *
 * Modified by: John V. Flickinger
 */

// start anonymous scope
;(function() {
'use strict';

//------------------------------------------------------------------------------
// Chess Util Functions
//------------------------------------------------------------------------------
var COLUMNS = 'abcdefghijklmn'.split('');

function validMove(move) {
  // move should be a string
  if (typeof move !== 'string') return false;

  // move should be in the form of "e2-e4", "f6-d5"
  var tmp = move.split('-');
  if (tmp.length !== 2) return false;
  return (validSquare(tmp[0]) === true && validSquare(tmp[1]) === true);
}

function validSquare(square) {
  if (typeof square !== 'string') return false;

  return (square.search(/^[a-n][1-9][0-9]?$/) !== -1);
}

function validPieceCode(code) {
  if (typeof code !== 'string') return false;
  return (code.search(/^[rgbw][KQRNBP]$/) !== -1);
}

// TODO: this whole function could probably be replaced with a single regex
function validFen(fen) {
  if (typeof fen !== 'string') return false;

  // cut off any move, castling, etc info from the end
  // we're only interested in position information
  fen = fen.replace(/ .+$/, '');

  // FEN should be 14 sections separated by slashes
  var chunks = fen.split('/');
  if (chunks.length !== 14) return false;

  // check the piece sections
  // for (var i = 0; i < 14; i++) {
    // if (chunks[i] === '' ||
        // chunks[i].length > 14 ||
        // chunks[i].search(/[^kqrbnpKQRNBP1-14]/) !== -1) {
        	// console.log("here");
      // return false;
    // }
  // }

  return true;
}

function validPositionObject(pos) {
  if (typeof pos !== 'object') return false;

  for (var i in pos) {
    if (pos.hasOwnProperty(i) !== true) continue;
    // console.log("pos[i]: " + pos[i] + " validPieceCode: " + validPieceCode(pos[i]));
    if (validSquare(i) !== true || validPieceCode(pos[i]) !== true) {
      return false;
    }
  }

  return true;
}

// convert FEN string to position object
// returns false if the FEN string is invalid
function fenToObj(fen) {
  if (validFen(fen) !== true) {
    return false;
  }

  // cut off any move, castling, etc info from the end
  // we're only interested in position information
  fen = fen.split('-')[0];  //throw away other positin info
  fen = fen.replace(/ .+$/, '');

  var rows = fen.split('/');
  var position = {};

  var currentRow = 14;
  for (var i = 0; i < 14; i++) {
    var row = rows[i].split(',');
    var colIndex = 0;

    // loop through each piece in the FEN section
    for (var j = 0; j < row.length; j++) {
      // number / empty squares
      if (/^\d+$/.test(row[j])) {
			var emptySquares = parseInt(row[j], 10);
			colIndex += emptySquares;
	  }
      // piece
      else {
        var square = COLUMNS[colIndex] + currentRow;

        position[square] = row[j];

        colIndex++;
      }
    }

    currentRow--;
  }


  return position;
}

// position object to FEN string
// returns false if the obj is not a valid position object
function objToFen(obj) {
  if (validPositionObject(obj) !== true) {
    return false;
  }

  var fen = '';

  var currentRow = 14;
  for (var i = 0; i < 14; i++) {
    for (var j = 0; j < 14; j++) {
      var square = COLUMNS[j] + currentRow;

      // piece exists
      if (obj.hasOwnProperty(square) === true) {
        fen += obj[square];
      }

      // empty space
      else {
        fen += '1';
      }
      fen += ',';
    }

    if (i !== 13) {
      fen += '/';
    }

    currentRow--;
  }

  // Modified Chessboardjs squeeze solution, I ALSO love it haha
  fen = fen.replace(/1,1,1,1,1,1,1,1,1,1,1,1,1,1/g, '14,');
  fen = fen.replace(/1,1,1,1,1,1,1,1,1,1,1,1,1/g, '13,');
  fen = fen.replace(/1,1,1,1,1,1,1,1,1,1,1,1/g, '12,');
  fen = fen.replace(/1,1,1,1,1,1,1,1,1,1,1/g, '11,');
  fen = fen.replace(/1,1,1,1,1,1,1,1,1,1/g, '10,');
  fen = fen.replace(/1,1,1,1,1,1,1,1,1/g, '9,');
  fen = fen.replace(/1,1,1,1,1,1,1,1/g, '8,');
  fen = fen.replace(/1,1,1,1,1,1,1/g, '7,');
  fen = fen.replace(/1,1,1,1,1,1/g, '6,');
  fen = fen.replace(/1,1,1,1,1/g, '5,');
  fen = fen.replace(/1,1,1,1/g, '4,');
  fen = fen.replace(/1,1,1,/g, '3,');
  fen = fen.replace(/1,1/g, '2,');

  fen = fen.replace(/,,/g, ',');
  fen = fen.replace(/,\//g, '/');
  fen = fen.slice(0, -1);

  return fen;
}

window['FourChessBoard'] = window['FourChessBoard'] || function(containerElOrId, cfg) {
'use strict';

cfg = cfg || {};

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var MINIMUM_JQUERY_VERSION = '1.7.0',

  /* I customized the FEN format for 4 player chess */
  START_FEN = '3,bR,bN,bB,bK,bQ,bB,bN,bR,3/3,bP,bP,bP,bP,bP,bP,bP,bP,3/14/gR,gP,10,rP,rR/' +
  				'gN,gP,10,rP,rN/gB,gP,10,rP,rB/gK,gP,10,rP,rQ/gQ,gP,10,rP,rK/gB,gP,10,rP,rB/' +
  				'gN,gP,10,rP,rN/gR,gP,10,rP,rR/14/3,wP,wP,wP,wP,wP,wP,wP,wP,3/3,wR,wN,wB,wQ,wK,wB,wN,wR,3',
  START_POSITION = fenToObj(START_FEN);

// use unique class names to prevent clashing with anything else on the page
// and simplify selectors
var CSS = {
  alpha: 'alpha-d2270',
  black: 'black-3c85d',
  board: 'board-b72b1',
  chessboard: 'chessboard-63f37',
  clearfix: 'clearfix-7da63',
  highlight1: 'highlight1-32417',
  highlight2: 'highlight2-9c5d2',
  notation: 'notation-322f9',
  numeric: 'numeric-fc462',
  piece: 'piece-417db',
  row: 'row-5277c',
  sparePieces: 'spare-pieces-7492f',
  sparePiecesBottom: 'spare-pieces-bottom-ae20f',
  sparePiecesTop: 'spare-pieces-top-4028b',
  square: 'square-55d63',
  white: 'white-1e1d7',
  blank: 'blank-e1da2',
  hred: 'promotion-red-4e6d3',
  hgold: 'promotion-gold-436de',
  hwhite: 'promotion-white-416de',
  hblack: 'promotion-black-1363e'
};

//------------------------------------------------------------------------------
// Module Scope Variables
//------------------------------------------------------------------------------

// DOM elements
var containerEl,
  boardEl,
  draggedPieceEl,
  sparePiecesTopEl,
  sparePiecesBottomEl;

// constructor return object
var widget = {};

//------------------------------------------------------------------------------
// Stateful
//------------------------------------------------------------------------------

var ANIMATION_HAPPENING = false,
  BOARD_BORDER_SIZE = 2,
  CURRENT_ORIENTATION = 'white',
  CURRENT_POSITION = {},
  SQUARE_SIZE,
  DRAGGED_PIECE,
  DRAGGED_PIECE_LOCATION,
  DRAGGED_PIECE_SOURCE,
  DRAGGING_A_PIECE = false,
  SPARE_PIECE_ELS_IDS = {},
  SQUARE_ELS_IDS = {},
  SQUARE_ELS_OFFSETS;

//------------------------------------------------------------------------------
// JS Util Functions
//------------------------------------------------------------------------------

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function createId() {
  return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function(c) {
    var r = Math.random() * 16 | 0;
    return r.toString(16);
  });
}

function deepCopy(thing) {
  return JSON.parse(JSON.stringify(thing));
}

function parseSemVer(version) {
  var tmp = version.split('.');
  return {
    major: parseInt(tmp[0], 10),
    minor: parseInt(tmp[1], 10),
    patch: parseInt(tmp[2], 10)
  };
}

// returns true if version is >= minimum
function compareSemVer(version, minimum) {
  version = parseSemVer(version);
  minimum = parseSemVer(minimum);

  var versionNum = (version.major * 10000 * 10000) +
    (version.minor * 10000) + version.patch;
  var minimumNum = (minimum.major * 10000 * 10000) +
    (minimum.minor * 10000) + minimum.patch;

  return (versionNum >= minimumNum);
}

//------------------------------------------------------------------------------
// Validation / Errors
//------------------------------------------------------------------------------

function error(code, msg, obj) {
  // do nothing if showErrors is not set
  if (cfg.hasOwnProperty('showErrors') !== true ||
      cfg.showErrors === false) {
    return;
  }

  var errorText = 'ChessBoard Error ' + code + ': ' + msg;

  // print to console
  if (cfg.showErrors === 'console' &&
      typeof console === 'object' &&
      typeof console.log === 'function') {
    console.log(errorText);
    if (arguments.length >= 2) {
      console.log(obj);
    }
    return;
  }

  // alert errors
  if (cfg.showErrors === 'alert') {
    if (obj) {
      errorText += '\n\n' + JSON.stringify(obj);
    }
    window.alert(errorText);
    return;
  }

  // custom function
  if (typeof cfg.showErrors === 'function') {
    cfg.showErrors(code, msg, obj);
  }
}

// check dependencies
function checkDeps() {
  // if containerId is a string, it must be the ID of a DOM node
  if (typeof containerElOrId === 'string') {
    // cannot be empty
    if (containerElOrId === '') {
      window.alert('ChessBoard Error 1001: ' +
        'The first argument to ChessBoard() cannot be an empty string.' +
        '\n\nExiting...');
      return false;
    }

    // make sure the container element exists in the DOM
    var el = document.getElementById(containerElOrId);
    if (! el) {
      window.alert('ChessBoard Error 1002: Element with id "' +
        containerElOrId + '" does not exist in the DOM.' +
        '\n\nExiting...');
      return false;
    }

    // set the containerEl
    containerEl = $(el);
  }

  // else it must be something that becomes a jQuery collection
  // with size 1
  // ie: a single DOM node or jQuery object
  else {
    containerEl = $(containerElOrId);

    if (containerEl.length !== 1) {
      window.alert('ChessBoard Error 1003: The first argument to ' +
        'ChessBoard() must be an ID or a single DOM node.' +
        '\n\nExiting...');
      return false;
    }
  }

  // JSON must exist
  if (! window.JSON ||
      typeof JSON.stringify !== 'function' ||
      typeof JSON.parse !== 'function') {
    window.alert('ChessBoard Error 1004: JSON does not exist. ' +
      'Please include a JSON polyfill.\n\nExiting...');
    return false;
  }

  // check for a compatible version of jQuery
  if (! (typeof window.$ && $.fn && $.fn.jquery &&
      compareSemVer($.fn.jquery, MINIMUM_JQUERY_VERSION) === true)) {
    window.alert('ChessBoard Error 1005: Unable to find a valid version ' +
      'of jQuery. Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or ' +
      'higher on the page.\n\nExiting...');
    return false;
  }

  return true;
}

function validAnimationSpeed(speed) {
  if (speed === 'fast' || speed === 'slow') {
    return true;
  }

  if ((parseInt(speed, 10) + '') !== (speed + '')) {
    return false;
  }

  return (speed >= 0);
}

// validate config / set default options
function expandConfig() {
  if (typeof cfg === 'string' || validPositionObject(cfg) === true) {
    cfg = {
      position: cfg
    };
  }

  // default for orientation is white
  if (cfg.orientation !== 'black' && cfg.orientation !== 'red' && cfg.orientation !== 'gold') {
    cfg.orientation = 'white';
  }
  CURRENT_ORIENTATION = cfg.orientation;

  // default for showNotation is true
  if (cfg.showNotation !== false) {
    cfg.showNotation = true;
  }

  // default for draggable is false
  if (cfg.draggable !== true) {
    cfg.draggable = false;
  }

  // default for dropOffBoard is 'snapback'
  if (cfg.dropOffBoard !== 'trash') {
    cfg.dropOffBoard = 'snapback';
  }

  // default for sparePieces is false
  if (cfg.sparePieces !== true) {
    cfg.sparePieces = false;
  }

  // draggable must be true if sparePieces is enabled
  if (cfg.sparePieces === true) {
    cfg.draggable = true;
  }

  // default piece theme is wikipedia
  if (cfg.hasOwnProperty('pieceTheme') !== true ||
      (typeof cfg.pieceTheme !== 'string' &&
       typeof cfg.pieceTheme !== 'function')) {
    cfg.pieceTheme = 'img/chesspieces/wikipedia/{piece}.png';
  }

  // animation speeds
  if (cfg.hasOwnProperty('appearSpeed') !== true ||
      validAnimationSpeed(cfg.appearSpeed) !== true) {
    cfg.appearSpeed = 200;
  }
  if (cfg.hasOwnProperty('moveSpeed') !== true ||
      validAnimationSpeed(cfg.moveSpeed) !== true) {
    cfg.moveSpeed = 200;
  }
  if (cfg.hasOwnProperty('snapbackSpeed') !== true ||
      validAnimationSpeed(cfg.snapbackSpeed) !== true) {
    cfg.snapbackSpeed = 50;
  }
  if (cfg.hasOwnProperty('snapSpeed') !== true ||
      validAnimationSpeed(cfg.snapSpeed) !== true) {
    cfg.snapSpeed = 25;
  }
  if (cfg.hasOwnProperty('trashSpeed') !== true ||
      validAnimationSpeed(cfg.trashSpeed) !== true) {
    cfg.trashSpeed = 100;
  }

  // make sure position is valid
  if (cfg.hasOwnProperty('position') === true) {
    if (cfg.position === 'start') {
      CURRENT_POSITION = deepCopy(START_POSITION);
    }

    else if (validFen(cfg.position) === true) {
      CURRENT_POSITION = fenToObj(cfg.position);
    }

    else if (validPositionObject(cfg.position) === true) {
      CURRENT_POSITION = deepCopy(cfg.position);
    }

    else {
      error(7263, 'Invalid value passed to config.position.', cfg.position);
    }
  }

  return true;
}

//------------------------------------------------------------------------------
// DOM Misc
//------------------------------------------------------------------------------

// calculates square size based on the width of the container
// got a little CSS black magic here, so let me explain:
// get the width of the container element (could be anything), reduce by 1 for
// fudge factor, and then keep reducing until we find an exact mod 14 for
// our square size
function calculateSquareSize() {
  var containerWidth = parseInt(containerEl.css('width'), 10);

  // defensive, prevent infinite loop
  if (! containerWidth || containerWidth <= 0) {
    return 0;
  }

  // pad one pixel
  var boardWidth = containerWidth - 1;

  while (boardWidth % 14 !== 0 && boardWidth > 0) {
    boardWidth--;
  }

  return (boardWidth / 14);
}

// create random IDs for elements
function createElIds() {
  // squares on the board
  for (var i = 0; i < COLUMNS.length; i++) {
    for (var j = 1; j <= 14; j++) {
      var square = COLUMNS[i] + j;
      SQUARE_ELS_IDS[square] = square + '-' + createId();
    }
  }

  // spare pieces
  var pieces = 'KQRBNP'.split('');
  for (var i = 0; i < pieces.length; i++) {
    var whitePiece = 'w' + pieces[i];
    var blackPiece = 'b' + pieces[i];
    SPARE_PIECE_ELS_IDS[whitePiece] = whitePiece + '-' + createId();
    SPARE_PIECE_ELS_IDS[blackPiece] = blackPiece + '-' + createId();
  }
}

//------------------------------------------------------------------------------
// Markup Building
//------------------------------------------------------------------------------

function buildBoardContainer() {
  var html = '<div class="' + CSS.chessboard + '">';

  if (cfg.sparePieces === true) {
    html += '<div class="' + CSS.sparePieces + ' ' +
      CSS.sparePiecesTop + '"></div>';
  }

  html += '<div class="' + CSS.board + '"></div>';

  if (cfg.sparePieces === true) {
    html += '<div class="' + CSS.sparePieces + ' ' +
      CSS.sparePiecesBottom + '"></div>';
  }

  html += '</div>';

  return html;
}

/*
var buildSquare = function(color, size, id) {
  var html = '<div class="' + CSS.square + ' ' + CSS[color] + '" ' +
  'style="width: ' + size + 'px; height: ' + size + 'px" ' +
  'id="' + id + '">';

  if (cfg.showNotation === true) {

  }

  html += '</div>';

  return html;
};
*/


function buildBoardSide(orientation) {
	var html = '';

	// algebraic notation / orientation
	var alpha = "1,2,3,4,5,6,7,8,9,10,11,12,13,14".split(',');
	var beta = deepCopy(COLUMNS);
	var row = 14;
	if (orientation === 'gold') {
		beta.reverse();
		alpha.reverse();
		row = 1;
	}

	var squareColor = 'black';

	var j1, j2, i1, i2;
  if(orientation == 'red') {
    j1 = 3;
    j2 = 10;
    i1 = 3;
    i2 = 10;
  } else {
    j1 = 10;
    j2 = 3;
    i1 = 10;
    i2 = 3;
  }

	for (var i = 0; i < 14; i++) {	//go through every row
		html += '<div class="' + CSS.row + '">';
		for (var j = 0; j < 14; j++) { //go through every column

			var square =  beta[i] + alpha[j];

			if( (i < 3 && j < 3) || (i > 10 && j > 10) || (i < 3 && j > 10) || (i > 10 && j < 3)) {
			  html += '<div class="' + CSS.square + ' ' + CSS['blank'] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			} else if(j == j1) {
			  html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + CSS['hblack'] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			} else if(j == j2) {
			  html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + CSS['hwhite'] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			} else if(i == i1) {
			  html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + CSS['hred'] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			} else if(i == i2) {
			  html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + CSS['hgold'] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			} else {
			  html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			}
      
			if (cfg.showNotation === true) {
        var alpha_outer = "", numeric_outer = "";
        if (['a', 'b', 'c', 'l', 'm', 'n'].includes(beta[i])) {
          alpha_outer = " outer-notation";
        }
        if(['1', '2', '3', '12', '13', '14'].includes(alpha[j])) {
          numeric_outer = " outer-notation";
        }
				// alpha notation
				if ((orientation === 'red' && beta[i] === 'n') || (orientation === 'gold' && beta[i] === 'a')) {
					html += '<div class="' + CSS.notation + ' ' + CSS.alpha + alpha_outer + '">' + alpha[j] + '</div>';
				}

				// numeric notation
				if (j === 0) {
					html += '<div class="' + CSS.notation + ' ' + CSS.numeric + numeric_outer + '">' + beta[i] + '</div>';
				}
			}

			html += '</div>';
			// end .square

			squareColor = (squareColor === 'white' ? 'black' : 'white');
		}
		html += '<div class="' + CSS.clearfix + '"></div></div>';

		squareColor = (squareColor === 'white' ? 'black' : 'white');

		if (orientation === 'gold') {
			row--;
		} else {
			row++;
		}
	}

	return html;

}

function buildBoard(orientation) {
  if (orientation !== 'black' && orientation !== 'gold' && orientation !== 'red') {
    orientation = 'white';
  }

  if(orientation === 'gold' || orientation === 'red') {
  		return buildBoardSide(orientation);
  }

  var html = '';

  // algebraic notation / orientation
  var alpha = deepCopy(COLUMNS);
  var row = 14;
  if (orientation === 'black') {
    alpha.reverse();
    row = 1;
  }

  var squareColor = 'white';

  var j1, j2, i1, i2;
  if(orientation == 'red') {
    j1 = 3;
    j2 = 10;
    i1 = 3;
    i2 = 10;
  } else {
    j1 = 10;
    j2 = 3;
    i1 = 10;
    i2 = 3;
  }
  for (var i = 0; i < 14; i++) {
    html += '<div class="' + CSS.row + '">';
    for (var j = 0; j < 14; j++) {

      var square = alpha[j] + row;

      if( (i < 3 && j < 3) || (i > 10 && j > 10) || (i < 3 && j > 10) || (i > 10 && j < 3)) {
        html += '<div class="' + CSS.square + ' ' + CSS['blank'] + ' ' +
        'square-' + square + '" ' +
        'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' +
        'id="' + SQUARE_ELS_IDS[square] + '" ' +
        'data-square="' + square + '">';
      } else if(j == j1) {
			  html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + CSS['hred'] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			} else if(j == j2) {
			  html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + CSS['hgold'] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			} else if(i == i1) {
			  html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + CSS['hwhite'] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			} else if(i == i2) {
			  html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' + CSS['hblack'] + ' ' + 'square-' + square + '" ' + 'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' + 'id="' + SQUARE_ELS_IDS[square] + '" ' + 'data-square="' + square + '">';
			} else {
        html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' +
        'square-' + square + '" ' +
        'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' +
        'id="' + SQUARE_ELS_IDS[square] + '" ' +
        'data-square="' + square + '">';
      }

      // html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' ' +
      //   'square-' + square + '" ' +
      //   'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' +
      //   'id="' + SQUARE_ELS_IDS[square] + '" ' +
      //   'data-square="' + square + '">';

      if (cfg.showNotation === true) {
        var alpha_outer = "", numeric_outer = "";
        if (['a', 'b', 'c', 'l', 'm', 'n'].includes(alpha[j])) {
          alpha_outer = " outer-notation";
        }
        if (['1', '2', '3', '12', '13', '14'].includes(row.toString())) {
          numeric_outer = " outer-notation";
        }
        // alpha notation
        if ((orientation === 'white' && row === 1) ||
            (orientation === 'black' && row === 14)) {
          html += '<div class="' + CSS.notation + ' ' + CSS.alpha + alpha_outer + '">' +
            alpha[j] + '</div>';
        }

        // numeric notation
        if (j === 0) {
          html += '<div class="' + CSS.notation + ' ' + CSS.numeric + numeric_outer + '">' +
            row + '</div>';
        }
      }

      html += '</div>'; // end .square

      squareColor = (squareColor === 'white' ? 'black' : 'white');
    }
    html += '<div class="' + CSS.clearfix + '"></div></div>';

    squareColor = (squareColor === 'white' ? 'black' : 'white');

    if (orientation === 'white') {
      row--;
    }
    else {
      row++;
    }
  }

  return html;
}

function buildPieceImgSrc(piece) {
  if (typeof cfg.pieceTheme === 'function') {
    return cfg.pieceTheme(piece);
  }

  if (typeof cfg.pieceTheme === 'string') {
    return cfg.pieceTheme.replace(/{piece}/g, piece);
  }

  // NOTE: this should never happen
  error(8272, 'Unable to build image source for cfg.pieceTheme.');
  return '';
}

function buildPiece(piece, hidden, id) {
  var html = '<img src="' + buildPieceImgSrc(piece) + '" ';
  if (id && typeof id === 'string') {
    html += 'id="' + id + '" ';
  }
  html += 'alt="" ' +
  'class="' + CSS.piece + '" ' +
  'data-piece="' + piece + '" ' +
  'style="width: ' + SQUARE_SIZE + 'px;' +
  'height: ' + SQUARE_SIZE + 'px;';
  if (hidden === true) {
    html += 'display:none;';
  }
  html += '" />';

  return html;
}

function buildSparePieces(color) {
  var pieces = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'];
  if (color === 'black') {
    pieces = ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];
  }

  var html = '';
  for (var i = 0; i < pieces.length; i++) {
    html += buildPiece(pieces[i], false, SPARE_PIECE_ELS_IDS[pieces[i]]);
  }

  return html;
}

//------------------------------------------------------------------------------
// Animations
//------------------------------------------------------------------------------

function animateSquareToSquare(src, dest, piece, completeFn) {
  // get information about the source and destination squares
  var srcSquareEl = $('#' + SQUARE_ELS_IDS[src]);
  var srcSquarePosition = srcSquareEl.offset();
  var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
  var destSquarePosition = destSquareEl.offset();

  // create the animated piece and absolutely position it
  // over the source square
  var animatedPieceId = createId();
  $('body').append(buildPiece(piece, true, animatedPieceId));
  var animatedPieceEl = $('#' + animatedPieceId);
  animatedPieceEl.css({
    display: '',
    position: 'absolute',
    top: srcSquarePosition.top,
    left: srcSquarePosition.left
  });

  // remove original piece from source square
  srcSquareEl.find('.' + CSS.piece).remove();

  // on complete
  var complete = function() {
    // add the "real" piece to the destination square
    destSquareEl.append(buildPiece(piece));

    // remove the animated piece
    animatedPieceEl.remove();

    // run complete function
    if (typeof completeFn === 'function') {
      completeFn();
    }
  };

  // animate the piece to the destination square
  var opts = {
    duration: cfg.moveSpeed,
    complete: complete
  };
  animatedPieceEl.animate(destSquarePosition, opts);
}

function animateSparePieceToSquare(piece, dest, completeFn) {
  var srcOffset = $('#' + SPARE_PIECE_ELS_IDS[piece]).offset();
  var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
  var destOffset = destSquareEl.offset();

  // create the animate piece
  var pieceId = createId();
  $('body').append(buildPiece(piece, true, pieceId));
  var animatedPieceEl = $('#' + pieceId);
  animatedPieceEl.css({
    display: '',
    position: 'absolute',
    left: srcOffset.left,
    top: srcOffset.top
  });

  // on complete
  var complete = function() {
    // add the "real" piece to the destination square
    destSquareEl.find('.' + CSS.piece).remove();
    destSquareEl.append(buildPiece(piece));

    // remove the animated piece
    animatedPieceEl.remove();

    // run complete function
    if (typeof completeFn === 'function') {
      completeFn();
    }
  };

  // animate the piece to the destination square
  var opts = {
    duration: cfg.moveSpeed,
    complete: complete
  };
  animatedPieceEl.animate(destOffset, opts);
}

// execute an array of animations
function doAnimations(a, oldPos, newPos) {
  ANIMATION_HAPPENING = true;

  var numFinished = 0;
  function onFinish() {
    numFinished++;

    // exit if all the animations aren't finished
    if (numFinished !== a.length) return;

    drawPositionInstant();
    ANIMATION_HAPPENING = false;

    // run their onMoveEnd function
    if (cfg.hasOwnProperty('onMoveEnd') === true &&
      typeof cfg.onMoveEnd === 'function') {
      cfg.onMoveEnd(deepCopy(oldPos), deepCopy(newPos));
    }
  }

  for (var i = 0; i < a.length; i++) {
    // clear a piece
    if (a[i].type === 'clear') {
      $('#' + SQUARE_ELS_IDS[a[i].square] + ' .' + CSS.piece)
        .fadeOut(cfg.trashSpeed, onFinish);
    }

    // add a piece (no spare pieces)
    if (a[i].type === 'add' && cfg.sparePieces !== true) {
      $('#' + SQUARE_ELS_IDS[a[i].square])
        .append(buildPiece(a[i].piece, true))
        .find('.' + CSS.piece)
        .fadeIn(cfg.appearSpeed, onFinish);
    }

    // add a piece from a spare piece
    if (a[i].type === 'add' && cfg.sparePieces === true) {
      animateSparePieceToSquare(a[i].piece, a[i].square, onFinish);
    }

    // move a piece
    if (a[i].type === 'move') {
      animateSquareToSquare(a[i].source, a[i].destination, a[i].piece,
        onFinish);
    }
  }
}

// returns the distance between two squares
function squareDistance(s1, s2) {
  s1 = s1.split('');
  var s1x = COLUMNS.indexOf(s1[0]) + 1;
  var s1y = parseInt(s1[1], 10);

  s2 = s2.split('');
  var s2x = COLUMNS.indexOf(s2[0]) + 1;
  var s2y = parseInt(s2[1], 10);

  var xDelta = Math.abs(s1x - s2x);
  var yDelta = Math.abs(s1y - s2y);

  if (xDelta >= yDelta) return xDelta;
  return yDelta;
}

// returns an array of closest squares from square
function createRadius(square) {
  var squares = [];

  // calculate distance of all squares
  for (var i = 0; i < 14; i++) {
    for (var j = 0; j < 14; j++) {
      var s = COLUMNS[i] + (j + 1);

      // skip the square we're starting from
      if (square === s) continue;

      squares.push({
        square: s,
        distance: squareDistance(square, s)
      });
    }
  }

  // sort by distance
  squares.sort(function(a, b) {
    return a.distance - b.distance;
  });

  // just return the square code
  var squares2 = [];
  for (var i = 0; i < squares.length; i++) {
    squares2.push(squares[i].square);
  }

  return squares2;
}

// returns the square of the closest instance of piece
// returns false if no instance of piece is found in position
function findClosestPiece(position, piece, square) {
  // create array of closest squares from square
  var closestSquares = createRadius(square);

  // search through the position in order of distance for the piece
  for (var i = 0; i < closestSquares.length; i++) {
    var s = closestSquares[i];

    if (position.hasOwnProperty(s) === true && position[s] === piece) {
      return s;
    }
  }

  return false;
}

// calculate an array of animations that need to happen in order to get
// from pos1 to pos2
function calculateAnimations(pos1, pos2) {
  // make copies of both
  pos1 = deepCopy(pos1);
  pos2 = deepCopy(pos2);

  var animations = [];
  var squaresMovedTo = {};

  // remove pieces that are the same in both positions
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    if (pos1.hasOwnProperty(i) === true && pos1[i] === pos2[i]) {
      delete pos1[i];
      delete pos2[i];
    }
  }

  // find all the "move" animations
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    var closestPiece = findClosestPiece(pos1, pos2[i], i);
    if (closestPiece !== false) {
      animations.push({
        type: 'move',
        source: closestPiece,
        destination: i,
        piece: pos2[i]
      });

      delete pos1[closestPiece];
      delete pos2[i];
      squaresMovedTo[i] = true;
    }
  }

  // add pieces to pos2
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    animations.push({
      type: 'add',
      square: i,
      piece: pos2[i]
    })

    delete pos2[i];
  }

  // clear pieces from pos1
  for (var i in pos1) {
    if (pos1.hasOwnProperty(i) !== true) continue;

    // do not clear a piece if it is on a square that is the result
    // of a "move", ie: a piece capture
    if (squaresMovedTo.hasOwnProperty(i) === true) continue;

    animations.push({
      type: 'clear',
      square: i,
      piece: pos1[i]
    });

    delete pos1[i];
  }

  return animations;
}

//------------------------------------------------------------------------------
// Control Flow
//------------------------------------------------------------------------------

function drawPositionInstant() {
  // clear the board
  boardEl.find('.' + CSS.piece).remove();

  // add the pieces
  for (var i in CURRENT_POSITION) {
    if (CURRENT_POSITION.hasOwnProperty(i) !== true) continue;

    $('#' + SQUARE_ELS_IDS[i]).append(buildPiece(CURRENT_POSITION[i]));
  }
}

function drawBoard() {
  boardEl.html(buildBoard(CURRENT_ORIENTATION));
  drawPositionInstant();

  if (cfg.sparePieces === true) {
    if (CURRENT_ORIENTATION === 'white') {
      sparePiecesTopEl.html(buildSparePieces('black'));
      sparePiecesBottomEl.html(buildSparePieces('white'));
    }
    else {
      sparePiecesTopEl.html(buildSparePieces('white'));
      sparePiecesBottomEl.html(buildSparePieces('black'));
    }
  }
}

// given a position and a set of moves, return a new position
// with the moves executed
function calculatePositionFromMoves(position, moves) {
  position = deepCopy(position);

  for (var i in moves) {
    if (moves.hasOwnProperty(i) !== true) continue;

    // skip the move if the position doesn't have a piece on the source square
    if (position.hasOwnProperty(i) !== true) continue;

    var piece = position[i];
    delete position[i];
    position[moves[i]] = piece;
  }
  return position;
}

function setCurrentPosition(position) {
  var oldPos = deepCopy(CURRENT_POSITION);
  var newPos = deepCopy(position);
  var oldFen = objToFen(oldPos);
  var newFen = objToFen(newPos);

  // do nothing if no change in position
  if (oldFen === newFen) return;

  // run their onChange function
  if (cfg.hasOwnProperty('onChange') === true &&
    typeof cfg.onChange === 'function') {
    cfg.onChange(oldPos, newPos);
  }

  // update state
  CURRENT_POSITION = position;
}

function isXYOnSquare(x, y) {
  for (var i in SQUARE_ELS_OFFSETS) {
    if (SQUARE_ELS_OFFSETS.hasOwnProperty(i) !== true) continue;

    var s = SQUARE_ELS_OFFSETS[i];
    if (x >= s.left && x < s.left + SQUARE_SIZE &&
        y >= s.top && y < s.top + SQUARE_SIZE) {
      return i;
    }
  }

  return 'offboard';
}

// records the XY coords of every square into memory
function captureSquareOffsets() {
  SQUARE_ELS_OFFSETS = {};

  for (var i in SQUARE_ELS_IDS) {
    if (SQUARE_ELS_IDS.hasOwnProperty(i) !== true) continue;

    SQUARE_ELS_OFFSETS[i] = $('#' + SQUARE_ELS_IDS[i]).offset();
  }
}

function removeSquareHighlights() {
  boardEl.find('.' + CSS.square)
    .removeClass(CSS.highlight1 + ' ' + CSS.highlight2);
}

function snapbackDraggedPiece() {
  // there is no "snapback" for spare pieces
  if (DRAGGED_PIECE_SOURCE === 'spare') {
    trashDraggedPiece();
    return;
  }

  removeSquareHighlights();

  // animation complete
  function complete() {
    drawPositionInstant();
    draggedPieceEl.css('display', 'none');

    // run their onSnapbackEnd function
    if (cfg.hasOwnProperty('onSnapbackEnd') === true &&
      typeof cfg.onSnapbackEnd === 'function') {
      cfg.onSnapbackEnd(DRAGGED_PIECE, DRAGGED_PIECE_SOURCE,
        deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
    }
  }

  // get source square position
  var sourceSquarePosition =
    $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_SOURCE]).offset();

  // animate the piece to the target square
  var opts = {
    duration: cfg.snapbackSpeed,
    complete: complete
  };
  draggedPieceEl.animate(sourceSquarePosition, opts);

  // set state
  DRAGGING_A_PIECE = false;
}

function trashDraggedPiece() {
  removeSquareHighlights();

  // remove the source piece
  var newPosition = deepCopy(CURRENT_POSITION);
  delete newPosition[DRAGGED_PIECE_SOURCE];
  setCurrentPosition(newPosition);

  // redraw the position
  drawPositionInstant();

  // hide the dragged piece
  draggedPieceEl.fadeOut(cfg.trashSpeed);

  // set state
  DRAGGING_A_PIECE = false;
}

function dropDraggedPieceOnSquare(square) {
  removeSquareHighlights();

  // update position
  var newPosition = deepCopy(CURRENT_POSITION);
  delete newPosition[DRAGGED_PIECE_SOURCE];
  newPosition[square] = DRAGGED_PIECE;
  setCurrentPosition(newPosition);

  // get target square information
  var targetSquarePosition = $('#' + SQUARE_ELS_IDS[square]).offset();

  // animation complete
  var complete = function() {
    drawPositionInstant();
    draggedPieceEl.css('display', 'none');

    // execute their onSnapEnd function
    if (cfg.hasOwnProperty('onSnapEnd') === true &&
      typeof cfg.onSnapEnd === 'function') {
      cfg.onSnapEnd(DRAGGED_PIECE_SOURCE, square, DRAGGED_PIECE);
    }
  };

  // snap the piece to the target square
  var opts = {
    duration: cfg.snapSpeed,
    complete: complete
  };
  draggedPieceEl.animate(targetSquarePosition, opts);

  // set state
  DRAGGING_A_PIECE = false;
}

function beginDraggingPiece(source, piece, x, y) {
  // run their custom onDragStart function
  // their custom onDragStart function can cancel drag start
  if (typeof cfg.onDragStart === 'function' &&
      cfg.onDragStart(source, piece,
        deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION) === false) {
    return;
  }

  // set state
  DRAGGING_A_PIECE = true;
  DRAGGED_PIECE = piece;
  DRAGGED_PIECE_SOURCE = source;

  // if the piece came from spare pieces, location is offboard
  if (source === 'spare') {
    DRAGGED_PIECE_LOCATION = 'offboard';
  }
  else {
    DRAGGED_PIECE_LOCATION = source;
  }

  // capture the x, y coords of all squares in memory
  captureSquareOffsets();

  // create the dragged piece
  draggedPieceEl.attr('src', buildPieceImgSrc(piece))
    .css({
      display: '',
      position: 'absolute',
      left: x - (SQUARE_SIZE / 2),
      top: y - (SQUARE_SIZE / 2),
      cursor: 'move',
      'z-index': '999'
    });

  if (source !== 'spare') {
    // highlight the source square and hide the piece
    $('#' + SQUARE_ELS_IDS[source]).addClass(CSS.highlight1)
      .find('.' + CSS.piece).css('display', 'none');
  }
}

function updateDraggedPiece(x, y) {
  // put the dragged piece over the mouse cursor
  draggedPieceEl.css({
    left: x - (SQUARE_SIZE / 2),
    top: y - (SQUARE_SIZE / 2)
  });

  // get location
  var location = isXYOnSquare(x, y);

  // do nothing if the location has not changed
  if (location === DRAGGED_PIECE_LOCATION) return;

  // remove highlight from previous square
  if (validSquare(DRAGGED_PIECE_LOCATION) === true) {
    $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_LOCATION])
      .removeClass(CSS.highlight2);
  }

  // add highlight to new square
  if (validSquare(location) === true) {
    $('#' + SQUARE_ELS_IDS[location]).addClass(CSS.highlight2);
  }

  // run onDragMove
  if (typeof cfg.onDragMove === 'function') {
    cfg.onDragMove(location, DRAGGED_PIECE_LOCATION,
      DRAGGED_PIECE_SOURCE, DRAGGED_PIECE,
      deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
  }

  // update state
  DRAGGED_PIECE_LOCATION = location;
}

function stopDraggedPiece(location) {
  // determine what the action should be
  var action = 'drop';
  if (location === 'offboard' && cfg.dropOffBoard === 'snapback') {
    action = 'snapback';
  }
  if (location === 'offboard' && cfg.dropOffBoard === 'trash') {
    action = 'trash';
  }

  // run their onDrop function, which can potentially change the drop action
  if (cfg.hasOwnProperty('onDrop') === true &&
    typeof cfg.onDrop === 'function') {
    var newPosition = deepCopy(CURRENT_POSITION);

    // source piece is a spare piece and position is off the board
    //if (DRAGGED_PIECE_SOURCE === 'spare' && location === 'offboard') {...}
    // position has not changed; do nothing

    // source piece is a spare piece and position is on the board
    if (DRAGGED_PIECE_SOURCE === 'spare' && validSquare(location) === true) {
      // add the piece to the board
      newPosition[location] = DRAGGED_PIECE;
    }

    // source piece was on the board and position is off the board
    if (validSquare(DRAGGED_PIECE_SOURCE) === true && location === 'offboard') {
      // remove the piece from the board
      delete newPosition[DRAGGED_PIECE_SOURCE];
    }

    // source piece was on the board and position is on the board
    if (validSquare(DRAGGED_PIECE_SOURCE) === true &&
      validSquare(location) === true) {
      // move the piece
      delete newPosition[DRAGGED_PIECE_SOURCE];
      newPosition[location] = DRAGGED_PIECE;
    }

    var oldPosition = deepCopy(CURRENT_POSITION);

    var result = cfg.onDrop(DRAGGED_PIECE_SOURCE, location, DRAGGED_PIECE,
      newPosition, oldPosition, CURRENT_ORIENTATION);
    if (result === 'snapback' || result === 'trash') {
      action = result;
    }
  }

  // do it!
  if (action === 'snapback') {
    snapbackDraggedPiece();
  }
  else if (action === 'trash') {
    trashDraggedPiece();
  }
  else if (action === 'drop') {
    dropDraggedPieceOnSquare(location);
  }
}

//------------------------------------------------------------------------------
// Public Methods
//------------------------------------------------------------------------------
widget.removePiecesBySquares = function(squares) {
    for(var i = 0; i < squares.length; ++i) {
        // remove the source piece
        var newPosition = deepCopy(CURRENT_POSITION);
        delete newPosition[squares[i]];
        setCurrentPosition(newPosition);
    }
    // redraw the position
    drawPositionInstant();
};

// clear the board
widget.clear = function(useAnimation) {
  widget.position({}, useAnimation);
};

/*
// get or set config properties
// TODO: write this, GitHub Issue #1
widget.config = function(arg1, arg2) {
  // get the current config
  if (arguments.length === 0) {
    return deepCopy(cfg);
  }
};
*/

// remove the widget from the page
widget.destroy = function() {
  // remove markup
  containerEl.html('');
  draggedPieceEl.remove();

  // remove event handlers
  containerEl.unbind();
};

// shorthand method to get the current FEN
widget.fen = function() {
  return widget.position('fen');
};

// flip orientation
widget.flip = function() {
  widget.orientation('flip');
};

/*
// TODO: write this, GitHub Issue #5
widget.highlight = function() {

};
*/

// move pieces
widget.move = function() {
  // no need to throw an error here; just do nothing
  if (arguments.length === 0) return;

  var useAnimation = true;

  // collect the moves into an object
  var moves = {};
  for (var i = 0; i < arguments.length; i++) {
    // any "false" to this function means no animations
    if (arguments[i] === false) {
      useAnimation = false;
      continue;
    }

    // skip invalid arguments
    if (validMove(arguments[i]) !== true) {
      error(2826, 'Invalid move passed to the move method.', arguments[i]);
      continue;
    }

    var tmp = arguments[i].split('-');
    moves[tmp[0]] = tmp[1];
  }

  // calculate position from moves
  var newPos = calculatePositionFromMoves(CURRENT_POSITION, moves);

  // update the board
  widget.position(newPos, useAnimation);

  // return the new position object
  return newPos;
};

widget.orientation = function(arg) {
  // no arguments, return the current orientation
  if (arguments.length === 0) {
    return CURRENT_ORIENTATION;
  }

  // set the side
  if (arg === 'white' || arg === 'black' || arg === 'gold' || arg === 'red') {
    CURRENT_ORIENTATION = arg;
    drawBoard();
    return;
  }

  // flip orientation
  if (arg === 'flip') {
  	if(CURRENT_ORIENTATION === 'white') {
  		CURRENT_ORIENTATION = 'black';
  	} else if(CURRENT_ORIENTATION === 'black') {
  		CURRENT_ORIENTATION = 'white';
  	} else if(CURRENT_ORIENTATION === 'gold') {
  		CURRENT_ORIENTATION = 'red';
  	} else if(CURRENT_ORIENTATION === 'red') {
  		CURRENT_ORIENTATION = 'gold';
  	}

    drawBoard();
    return;
  }

  error(5482, 'Invalid value passed to the orientation method.', arg);
};

widget.position = function(position, useAnimation) {
  // no arguments, return the current position
  if (arguments.length === 0) {
    return deepCopy(CURRENT_POSITION);
  }

  // get position as FEN
  if (typeof position === 'string' && position.toLowerCase() === 'fen') {
    return objToFen(CURRENT_POSITION);
  }

  // default for useAnimations is true
  if (useAnimation !== false) {
    useAnimation = true;
  }

  // start position
  if (typeof position === 'string' && position.toLowerCase() === 'start') {
    position = deepCopy(START_POSITION);
  }

  // convert FEN to position object
  if (validFen(position) === true) {
    position = fenToObj(position);
    delete position.NaN;
  }

  // validate position object
  if (validPositionObject(position) !== true) {
    error(6482, 'Invalid value passed to the position method.', position);
    return;
  }

  if (useAnimation === true) {
    // start the animations
    doAnimations(calculateAnimations(CURRENT_POSITION, position),
      CURRENT_POSITION, position);

    // set the new position
    setCurrentPosition(position);
  }
  // instant update
  else {
    setCurrentPosition(position);
    drawPositionInstant();
  }
};

widget.resize = function() {
  // calulate the new square size
  SQUARE_SIZE = calculateSquareSize();

  // set board width
  boardEl.css('width', (SQUARE_SIZE * 14) + 'px');
  boardEl.css('border', "none");

  // set drag piece size
  draggedPieceEl.css({
    height: SQUARE_SIZE,
    width: SQUARE_SIZE
  });

  // spare pieces
  if (cfg.sparePieces === true) {
    containerEl.find('.' + CSS.sparePieces)
      .css('paddingLeft', (SQUARE_SIZE + BOARD_BORDER_SIZE) + 'px');
  }

  // redraw the board
  drawBoard();
};

// set the starting position
widget.start = function(useAnimation) {
  widget.position('start', useAnimation);
};

//------------------------------------------------------------------------------
// Browser Events
//------------------------------------------------------------------------------

function isTouchDevice() {
  return ('ontouchstart' in document.documentElement);
}

// reference: http://www.quirksmode.org/js/detect.html
function isMSIE() {
  return (navigator && navigator.userAgent &&
      navigator.userAgent.search(/MSIE/) !== -1);
}

function stopDefault(e) {
  e.preventDefault();
}

function mousedownSquare(e) {
  // do nothing if we're not draggable
  if (cfg.draggable !== true) return;

  var square = $(this).attr('data-square');

  // no piece on this square
  if (validSquare(square) !== true ||
      CURRENT_POSITION.hasOwnProperty(square) !== true) {
    return;
  }

  beginDraggingPiece(square, CURRENT_POSITION[square], e.pageX, e.pageY);
}

function touchstartSquare(e) {
  // do nothing if we're not draggable
  if (cfg.draggable !== true) return;

  var square = $(this).attr('data-square');

  // no piece on this square
  if (validSquare(square) !== true ||
      CURRENT_POSITION.hasOwnProperty(square) !== true) {
    return;
  }

  e = e.originalEvent;
  beginDraggingPiece(square, CURRENT_POSITION[square],
    e.changedTouches[0].pageX, e.changedTouches[0].pageY);
}

function mousedownSparePiece(e) {
  // do nothing if sparePieces is not enabled
  if (cfg.sparePieces !== true) return;

  var piece = $(this).attr('data-piece');

  beginDraggingPiece('spare', piece, e.pageX, e.pageY);
}

function touchstartSparePiece(e) {
  // do nothing if sparePieces is not enabled
  if (cfg.sparePieces !== true) return;

  var piece = $(this).attr('data-piece');

  e = e.originalEvent;
  beginDraggingPiece('spare', piece,
    e.changedTouches[0].pageX, e.changedTouches[0].pageY);
}

function mousemoveWindow(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  updateDraggedPiece(e.pageX, e.pageY);
}

function touchmoveWindow(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  // prevent screen from scrolling
  e.preventDefault();

  updateDraggedPiece(e.originalEvent.changedTouches[0].pageX,
    e.originalEvent.changedTouches[0].pageY);
}

function mouseupWindow(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  // get the location
  var location = isXYOnSquare(e.pageX, e.pageY);

  stopDraggedPiece(location);
}

function touchendWindow(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  // get the location
  var location = isXYOnSquare(e.originalEvent.changedTouches[0].pageX,
    e.originalEvent.changedTouches[0].pageY);

  stopDraggedPiece(location);
}

function mouseenterSquare(e) {
  // do not fire this event if we are dragging a piece
  // NOTE: this should never happen, but it's a safeguard
  if (DRAGGING_A_PIECE !== false) return;

  if (cfg.hasOwnProperty('onMouseoverSquare') !== true ||
    typeof cfg.onMouseoverSquare !== 'function') return;

  // get the square
  var square = $(e.currentTarget).attr('data-square');;

  // NOTE: this should never happen; defensive
  if (validSquare(square) !== true) return;

  // get the piece on this square
  var piece = false;
  if (CURRENT_POSITION.hasOwnProperty(square) === true) {
    piece = CURRENT_POSITION[square];
  }

  // execute their function
  cfg.onMouseoverSquare(square, piece, deepCopy(CURRENT_POSITION),
    CURRENT_ORIENTATION);
}

function mouseleaveSquare(e) {
  // do not fire this event if we are dragging a piece
  // NOTE: this should never happen, but it's a safeguard
  if (DRAGGING_A_PIECE !== false) return;

  if (cfg.hasOwnProperty('onMouseoutSquare') !== true ||
    typeof cfg.onMouseoutSquare !== 'function') return;

  // get the square
  var square = $(e.currentTarget).attr('data-square');

  // NOTE: this should never happen; defensive
  if (validSquare(square) !== true) return;

  // get the piece on this square
  var piece = false;
  if (CURRENT_POSITION.hasOwnProperty(square) === true) {
    piece = CURRENT_POSITION[square];
  }

  // execute their function
  cfg.onMouseoutSquare(square, piece, deepCopy(CURRENT_POSITION),
    CURRENT_ORIENTATION);
}

//------------------------------------------------------------------------------
// Initialization
//------------------------------------------------------------------------------

function addEvents() {
  // prevent browser "image drag"
  $('body').on('mousedown mousemove', '.' + CSS.piece, stopDefault);

  // mouse drag pieces
  boardEl.on('mousedown', '.' + CSS.square, mousedownSquare);
  containerEl.on('mousedown', '.' + CSS.sparePieces + ' .' + CSS.piece,
    mousedownSparePiece);

  // mouse enter / leave square
  boardEl.on('mouseenter', '.' + CSS.square, mouseenterSquare);
  boardEl.on('mouseleave', '.' + CSS.square, mouseleaveSquare);

  // IE doesn't like the events on the window object, but other browsers
  // perform better that way
  if (isMSIE() === true) {
    // IE-specific prevent browser "image drag"
    document.ondragstart = function() { return false; };

    $('body').on('mousemove', mousemoveWindow);
    $('body').on('mouseup', mouseupWindow);
  }
  else {
    $(window).on('mousemove', mousemoveWindow);
    $(window).on('mouseup', mouseupWindow);
  }

  // touch drag pieces
  if (isTouchDevice() === true) {
    boardEl.on('touchstart', '.' + CSS.square, touchstartSquare);
    containerEl.on('touchstart', '.' + CSS.sparePieces + ' .' + CSS.piece,
      touchstartSparePiece);
    $(window).on('touchmove', touchmoveWindow);
    $(window).on('touchend', touchendWindow);
  }
}

function initDom() {
  // delete any existing drag pieces
  $('body .' + CSS.piece).remove();
  // build board and save it in memory
  containerEl.html(buildBoardContainer());
  boardEl = containerEl.find('.' + CSS.board);

  if (cfg.sparePieces === true) {
    sparePiecesTopEl = containerEl.find('.' + CSS.sparePiecesTop);
    sparePiecesBottomEl = containerEl.find('.' + CSS.sparePiecesBottom);
  }

  // create the drag piece
  var draggedPieceId = createId();
  $('body').append(buildPiece('wP', true, draggedPieceId));
  draggedPieceEl = $('#' + draggedPieceId);

  // get the border size
  BOARD_BORDER_SIZE = parseInt(boardEl.css('borderLeftWidth'), 10);

  // set the size and draw the board
  widget.resize();
}

function init() {
  if (checkDeps() !== true ||
      expandConfig() !== true) return;

  // create unique IDs for all the elements we will create
  createElIds();

  initDom();
  addEvents();
}

// go time
init();

// return the widget object
return widget;

}; // end window.ChessBoard

// expose util functions
window.FourChessBoard.fenToObj = fenToObj;
window.FourChessBoard.objToFen = objToFen;

})(); // end anonymous wrapper
