import React, {Component} from 'react';
import {connect} from 'react-redux';

import Chess from 'chess.js'; //game rules

import {newMove} from '../../actions/room';
import {DARK_SQUARE_HIGHLIGHT_COLOR, LIGHT_SQUARE_HIGHLIGHT_COLOR} from './board_wrapper.jsx'
import {DARK_SQUARE_PREMOVE_COLOR, LIGHT_SQUARE_PREMOVE_COLOR} from './board_wrapper.jsx'

class TwoBoard extends Component {

    constructor(props) {
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onSnapbackEnd = this.onSnapbackEnd.bind(this);
        this.board, this.boardEl = $('#board');
        this.shadeSquareSource = null;
        this.shadeSquareDest = null;
        this.prevMoveResizeListener = null;
        this.premove = null;
        this.newGameObject = this.props.newGameObject;
        this.setBoardPosition = this.props.setBoardPosition.bind(this);
        this.setBoardPosition = this.setBoardPosition.bind(this);
        this.cfg = {
            draggable: true,
            onDragStart: this.onDragStart,
            onDragMove: this.onDragMove,
            onDrop: this.onDrop,
            moveSpeed: 'fast',
            onMouseoutSquare: this.onMouseoutSquare,
            onMouseoverSquare: this.onMouseoverSquare,
            onSnapbackEnd: this.onSnapbackEnd
        };
        if (this.props.crazyhouse) {
            this.cfg.crazyhouse = this.props.crazyhouse;
        }
        this.drag = {from: '', to: ''};

    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.name != this.props.name) {
            return true;
        }
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.fen) {
            if (this.props.fen != nextProps.fen) {
                this.game.load(nextProps.fen);
                this.updatePosition(nextProps.fen);
            }
            let usColor = 'w';
            if(nextProps.room.black._id === nextProps.profile._id) {
                this.board.orientation('black');
                usColor = 'b';
            } else {
                this.board.orientation('white');
                usColor = 'w';
            }

            if(nextProps.move) {
                this.shadeSquareSource = nextProps.move.from;
                this.shadeSquareDest = nextProps.move.to;
                this.boardRedraw();
                let shadeOnResize = function(event) {
                    this.boardRedraw();
                }.bind(this);
                if (this.prevMoveResizeListener) {
                    // remove listener for previous move
                    window.removeEventListener('resize', this.prevMoveResizeListener);
                }
                window.addEventListener('resize', shadeOnResize);
                this.prevMoveResizeListener = shadeOnResize;
                // execute premove if it's our turn
                if (nextProps.room.turn === usColor) {
                    this.executePremove();
                }
            }
        } else {
            this.board.clear();
            this.shadeSquareSource = null
            this.shadeSquareDest = null;
            this.game = this.newGameObject();
            if (this.prevMoveResizeListener) {
                window.removeEventListener('resize', this.prevMoveResizeListener);
            }
            this.prevMoveResizeListener = null;
            this.drag = {from: '', to: ''};
            this.boardRedraw(); // redraw the board to remove square shading
        }
    }
    
    updatePosition(fen) {
        this.setBoardPosition(fen);
        let turn = this.formatTurn(this.game.turn());
        if (this.drag.from && this.props.room[turn]._id === this.props.profile._id) {
            // if the user is hovering a piece, delete it from the board position
            let pos = this.board.position();
            delete pos[this.drag.from];
            this.board.position(pos, false);
        }
    }
    
    // get the crazyhouse hand from the game object,
    // which is in the form:
    //   { w: [ {type: 'p', color: 'w'}, ...], b: ... }
    // and convert it to what chessboard.js expects,
    // which is the form:
    //   { wP: 1, wN: 0, ... }
    getBoardHand() {
        let hand = this.game.get_hand({verbose: true});
        let boardHand = {
            wP: 0, wN: 0, wB: 0, wR: 0, wQ: 0,
            bP: 0, bN: 0, bB: 0, bR: 0, bQ: 0
        };
        let handPieces = hand.w.concat(hand.b);
        handPieces.forEach(function(piece) {
            let key = piece.color.toLowerCase() + piece.type.toUpperCase();
            boardHand[key] += 1;
        });
        return boardHand;
    }

    isPieceInHand(piece, color) {
        let hand = this.game.get_hand({color: color, verbose: true});
        return hand.filter(p => p.type === piece).length > 0;
    }
    
    onDragStart(source, piece, position, orientation) {
        let pieceType = piece.charAt(1).toLowerCase();
        if(this.props.room.paused) {
            return false;
        }
        if (!this.props.profile || !this.props.room.black || !this.props.room.white) {
            return false;
        }
        if (source !== 'hand') {
            if (this.props.profile._id === this.props.room.white._id ||
                this.props.profile._id === this.props.room.black._id) {
                    // only set the drag squares for the user that's playing
                    this.drag.from = source;
                    this.drag.to = source;
                }
        }
        else if(this.props.profile._id === this.props.room.black._id) {
            //this is the black player
            if(piece.search(/^w/) !== -1) {
                return false;
            }
            if (source === 'hand') {
                return this.isPieceInHand(pieceType, 'b');
            }
            return true;

        } else if(this.props.profile._id === this.props.room.white._id && piece.search('/^b/') === -1) {
            //this is the white player
            if(piece.search(/^b/) !== -1) {
                return false;
            }
            if (source === 'hand') {
                return this.isPieceInHand(pieceType, 'w');
            }
            return true;
        } else {
            return false;
        }
    }
    
    onDragMove(newSquare, oldSquare, source, piece, position) {
        // if it's not our turn, save which square we're dragging
        // from and to so we can restore the border highlight
        // when a move is made
        let turn = this.formatTurn(this.game.turn());
        if(this.props.room[turn]._id !== this.props.profile._id) {
            this.drag = {from: source, to: newSquare};
        }
    }
    
    formatTurn(turn) {
        switch(turn) {
            case 'w':
                return 'white';
            case 'b':
                return 'black';
        }
    }
    
    boardRedraw() {
        if (this.props.crazyhouse === true) {
            $("#board").css("margin-left", "10%");
            $("#board").css("margin-right", "10%");
        }
        this.board.resize();
        this.shadeLastMove();
        this.renderPremove();
        this.drawHoverBorders();
    }

    shadeSquare(square) {
        if (!square || square === 'hand' || square === '@') {
            return;
        }
        var squareEl = $('#board .square-' + square);

        var background = LIGHT_SQUARE_HIGHLIGHT_COLOR;
        if (squareEl.hasClass('black-3c85d') === true) {
            background = DARK_SQUARE_HIGHLIGHT_COLOR;
        }

        squareEl.css('background', background);
    }
    
    shadeLastMove() {
        if (this.shadeSquareSource)
            this.shadeSquare(this.shadeSquareSource);
        if (this.shadeSquareDest)
            this.shadeSquare(this.shadeSquareDest);
    }
    
    drawHoverBorders() {
        // restore square border highlights after a move is received
        if (this.drag.from && this.drag.to) {
            $('#board .square-'+this.drag.from).addClass("highlight1-32417");
            $('#board .square-'+this.drag.to).addClass("highlight2-9c5d2");
            this.drag = {from: '', to: ''};
        }
    }
    
    shadeSquarePremove(square) {
        if (!square)
            return;
        var squareEl = $('#board .square-' + square);
        
        var background = LIGHT_SQUARE_PREMOVE_COLOR;
        if (squareEl.hasClass('black-3c85d') === true) {
            background = DARK_SQUARE_PREMOVE_COLOR;
        }

        squareEl.css('background', background);
    }
    
    renderPremove() {
        if (this.premove) {
            this.shadeSquarePremove(this.premove.source);
            this.shadeSquarePremove(this.premove.target);
        }
    }
    
    setPremove(source, target, piece) {
        this.resetPremove();
        let clickListener = (event) => {
            this.resetPremove();
        };
        $("#board").on('click', clickListener);
        this.premove = {
            source: source,
            target: target,
            piece: piece,
            clickListener: clickListener
        };
        // draw the premove
        this.renderPremove();
    }
    
    executePremove() {
        if (!this.premove)
            return;
        let from;
        if (this.premove.source === "hand") {
            from = '@';
        } else {
            from = this.premove.source;
        }
        let action = {
            from: from,
            to: this.premove.target,
            piece: this.premove.piece,
            promotion: 'q'
        };
        //this.game.move(action);
        //this.board.position(this.game.fen(), false);
        this.resetPremove();
        this.props.newMove(action, this.props.name);
    }
    
    resetPremove() {
        if (this.premove) {
            this.boardEl.off('click', this.premove.clickListener);
        }
        this.premove = null;
        this.drag = {from: '', to: ''};
        this.boardRedraw();
    }
    
    makeMove(action) {
        if (action.from === 'hand') {
            action.from = '@';
        }
        return this.game.move(action);
    }
    
    onSnapbackEnd(piece, square, position, orientation) {
        if (!this.drag.from) {
            this.setBoardPosition(this.props.fen);
        }
    }

    onDrop(source, target, piece) {
        this.drag = {from: '', to: ''};
        let turn = this.formatTurn(this.game.turn());
        if (piece.length > 1) {
            piece = piece.charAt(1).toLowerCase();
        }
        let action = {
            from: source,
            to: target,
            piece: piece,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        };
        if(this.props.room[turn]._id !== this.props.profile._id) {
            if (source === target) {
                // reset premove when clicking on a piece
                this.resetPremove();
            } else {
                // set as premove
                this.setPremove(source, target, piece);
            }
            return 'snapback';
        }

        // see if the move is legal
        let move = this.makeMove(action);

        // illegal move
        if (move === null) return 'snapback';
        this.game.undo();

        this.props.newMove(action, this.props.name);
        this.shadeSquareSource = source;
        this.shadeSquareDest = target;
        this.shadeLastMove();
    }

    onMouseoutSquare() {

    }

    onMouseoverSquare() {

    }
    
    componentDidMount() {
        this.board = new ChessBoard('board', this.cfg);
        this.game = this.newGameObject();

        //User has switched tabs and board just remounted
        if(this.props.fen) {
            this.game.load(this.props.fen);
            this.setBoardPosition(this.props.fen);

            //there is a pgn to get the prior moves
            if(this.props.pgn) {
                this.game.load_pgn(this.props.pgn);
            }

            if(this.props.room.black._id === this.props.profile._id) {
                this.board.orientation('black');
            }

            if(this.props.move) {
                this.game.move(this.props.move);
                this.shadeSquare(this.props.move.from);
                this.shadeSquare(this.props.move.to);
            }
        }

        window.addEventListener('resize', (event) => {
            this.boardRedraw();
        });
        this.boardRedraw();
    }

    render() {
        if (this.props.fen
            && this.props.move
            && this.props.move.from == this.shadeSquareSource
            && this.props.move.to == this.shadeSquareDest) {
                this.shadeLastMove();
        }
        return (
            <div id="board"></div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.auth.profile,
        fen: state.openThreads[state.activeThread].fen,
        pgn: state.openThreads[state.activeThread].pgn,
        move: state.openThreads[state.activeThread].move,
        room: state.openThreads[state.activeThread],
        name: state.activeThread,
    }
}

export default connect(mapStateToProps, {newMove}) (TwoBoard)
