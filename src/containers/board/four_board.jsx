import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fourNewMove} from '../../actions/room';
import FourChess from '../../../common/fourchess';
import {DARK_SQUARE_HIGHLIGHT_COLOR, LIGHT_SQUARE_HIGHLIGHT_COLOR} from './board_wrapper.jsx'
class FourBoard extends Component {

    constructor(props) {
        super(props);

        this.onDrop = this.onDrop.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.shadeSquareSource = null;
        this.shadeSquareDest = null;
        this.prevMoveResizeListener = null;
        this.boardEl = $('#board');
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.fen) {
            this.board.position(nextProps.fen);
            this.game.position(nextProps.fen);

            if(nextProps.room.white._id === nextProps.profile._id) {
                this.board.orientation('white');
            } else if(nextProps.room.black._id === nextProps.profile._id) {
                this.board.orientation('black');
            } else if(nextProps.room.gold._id === nextProps.profile._id) {
                this.board.orientation('gold');
            } else if(nextProps.room.red._id === nextProps.profile._id) {
                this.board.orientation('red');
            }

            if(nextProps.move) {
                console.log("shading:", nextProps.move.from, "-", nextProps.move.to);
                this.shadeSquare(nextProps.move.from);
                this.shadeSquare(nextProps.move.to);
                let shadeOnResize = function(event) {
                    this.shadeSquare(nextProps.move.from);
                    this.shadeSquare(nextProps.move.to);
                }.bind(this);
                if (this.prevMoveResizeListener) {
                    // remove listener for previous move
                    window.removeEventListener('resize', this.prevMoveResizeListener);
                }
                window.addEventListener('resize', shadeOnResize);
                this.prevMoveResizeListener = shadeOnResize;
            }

            if(nextProps.pgn) {
                //TODO fourchess still doesn't have a load pgn feature
            }

        } else {
            this.board.clear();
            this.game = new FourChess();
            if (this.prevMoveResizeListener) {
                window.removeEventListener('resize', this.prevMoveResizeListener);
            }
            this.prevMoveResizeListener = null;
            this.board.resize(); // redraw the board to remove square shading
        }
    }

    onDragStart(source, piece, position, orientation) {

        console.log("onDragStart");
        if(this.props.room.paused) {
            return false;
        }

        if(!this.game) {
            return false;
        }

        else if(this.props.profile._id === this.props.room.black._id) {
            //this is the black player
            if(piece.search(/^w/) !== -1 ||
               piece.search(/^g/) !== -1 ||
               piece.search(/^r/) !== -1) {
                return false;
            }
            return true;

        } else if(this.props.profile._id === this.props.room.white._id) {
            //this is the white player
            if(piece.search(/^b/) !== -1 ||
               piece.search(/^g/) !== -1 ||
               piece.search(/^r/) !== -1) {
                return false;
            }
            return true;
        } else if(this.props.profile._id === this.props.room.gold._id) {
            //this is the white player
            if(piece.search(/^b/) !== -1 ||
               piece.search(/^w/) !== -1 ||
               piece.search(/^r/) !== -1) {
                return false;
            }
            return true;
        } else if(this.props.profile._id === this.props.room.red._id) {
            //this is the white player
            if(piece.search(/^b/) !== -1 ||
               piece.search(/^g/) !== -1 ||
               piece.search(/^w/) !== -1) {
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
            case 'g':
                return 'gold';
            case 'r':
                return 'red';
        }
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

    onDrop(source, target) {
        let turn = this.formatTurn(this.game.turn());

        if(this.props.room[turn]._id !== this.props.profile._id) {
            return 'snapback';
        }

        let action = {
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        };

        // see if the move is legal
        let move = this.game.move(action);

        // illegal move
        if (move === null) return 'snapback';

        this.props.fourNewMove(action, this.props.name);
        console.log("onDrop shading:", source, "-", target);
        this.shadeSquareSource = source;
        this.shadeSquareDest = target;
        this.shadeSquare(this.shadeSquareSource);
        this.shadeSquare(this.shadeSquareDest);
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

        this.board = new FourChessBoard('board', cfg);
        this.game = new FourChess();

        window.addEventListener('resize', (event) => {
            this.board.resize();
        });

        if(this.props.fen) {
            this.board.position(this.props.fen);
            this.game.position(this.props.fen);
            if(this.props.room.white._id === this.props.profile._id) {
                this.board.orientation('white');
            }
            else if(this.props.room.black._id === this.props.profile._id) {
                this.board.orientation('black');
            }
            else if(this.props.room.gold._id === this.props.profile._id) {
                this.board.orientation('gold');
            }
            else if(this.props.room.red._id === this.props.profile._id) {
                this.board.orientation('red');
            }

            if(this.props.move) {
                this.shadeSquare(this.props.move.from);
                this.shadeSquare(this.props.move.to);
            }
        }
    }

    render() {
        this.shadeSquare(this.shadeSquareSource);
        this.shadeSquare(this.shadeSquareDest);
        return (
            <div id="board"></div>
        );
    }

}

function mapStateToProps(state) {
    return {
        profile: state.auth.profile,
        move: state.openThreads[state.activeThread].move,
        room: state.openThreads[state.activeThread],
        name: state.activeThread,
        fen: state.openThreads[state.activeThread].fen
    }
}

export default connect(mapStateToProps, {fourNewMove}) (FourBoard)
