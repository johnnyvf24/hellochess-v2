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
        this.onDragStart = this.onDragStart.bind(this);
        this.board, this.boardEl = $('#board');
        this.shadeSquareSource = null;
        this.shadeSquareDest = null;
        this.prevMoveResizeListener = null;
        this.premove = null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentWillReceiveProps(nextProps) {

        if(nextProps.fen) {
            this.board.position(nextProps.fen, false);
            this.game.load(nextProps.fen);
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
            if(nextProps.pgn) {
                this.game.load_pgn(nextProps.pgn);
            }
        } else {
            this.board.clear();
            this.game = new Chess();
            if (this.prevMoveResizeListener) {
                window.removeEventListener('resize', this.prevMoveResizeListener);
            }
            this.prevMoveResizeListener = null;
            this.boardRedraw(); // redraw the board to remove square shading
        }
    }


    onDragStart(source, piece, position, orientation) {

        if(this.props.room.paused) {
            return false;
        }

        else if(this.props.profile._id === this.props.room.black._id) {
            //this is the black player
            if(piece.search(/^w/) !== -1) {
                return false;
            }
            return true;

        } else if(this.props.profile._id === this.props.room.white._id && piece.search('/^b/') === -1) {
            //this is the white player
            if(piece.search(/^b/) !== -1) {
                return false;
            }
            return true;
        } else {
            return false;
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
        this.board.resize();
        this.shadeLastMove();
        this.renderPremove();
    }

    shadeSquare(square) {
        if (!square) {
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
    
    setPremove(source, target) {
        this.resetPremove();
        let clickListener = (event) => {
            this.resetPremove();
        };
        $("#board").on('click', clickListener);
        this.premove = {
            source: source,
            target: target,
            clickListener: clickListener
        }
        // draw the premove
        this.renderPremove();
    }
    
    executePremove() {
        if (!this.premove)
            return;
        let action = {
            from: this.premove.source,
            to: this.premove.target,
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
        this.boardRedraw();
    }

    onDrop(source, target) {
        let turn = this.formatTurn(this.game.turn());
        let action = {
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        };
        if(this.props.room[turn]._id !== this.props.profile._id) {
            // set as premove
            this.setPremove(source, target);
            return 'snapback';
        }

        // see if the move is legal
        let move = this.game.move(action);

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
        var cfg = {
            draggable: true,
            onDragStart: this.onDragStart,
            onDrop: this.onDrop,
            moveSpeed: 'fast',
            onMouseoutSquare: this.onMouseoutSquare,
            onMouseoverSquare: this.onMouseoverSquare
        };

        this.board = new ChessBoard('board', cfg);
        this.game = new Chess();

        //User has switched tabs and board just remounted
        if(this.props.fen) {
            this.board.position(this.props.fen);
            this.game.load(this.props.fen);

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
    }

    render() {
        if (this.props.fen
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
