import React, {Component} from 'react';
import {connect} from 'react-redux';

import Chess from 'chess.js'; //game rules

import {newMove} from '../../actions/room';

class TwoBoard extends Component {

    constructor(props) {
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.board, this.boardEl = $('#board');
        this.shadeSquareSource = null;
        this.shadeSquareDest = null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.fen) {
            this.game.load(nextProps.fen);
            this.board.position(nextProps.fen, false);

            if(nextProps.room.black._id === nextProps.profile._id) {
                this.board.orientation('black');
            } else {
                this.board.orientation('white');
            }
        } else {
            this.board.clear();
        }
        this.shadeSquare(this.shadeSquareSource);
        this.shadeSquare(this.shadeSquareDest);
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
    
    removeHighlights() {
        this.boardEl.find('.square-55d63').css('background', '')
    }
    
    shadeSquare(square) {
        if (!square) {
            return;
        }
        var squareEl = $('#board .square-' + square);

        var background = '#f2ffb2';
        if (squareEl.hasClass('black-3c85d') === true) {
            background = '#d2dd9b';
        }

        squareEl.css('background', background);
    }

    onDrop(source, target) {
        let action = {
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        };

        // see if the move is legal
        let move = this.game.move(action);

        // illegal move
        if (move === null) return 'snapback';
        

        this.props.newMove(action, this.props.name);
        this.shadeSquareSource = source;
        this.shadeSquareDest = target;
        this.shadeSquare(this.shadeSquareSource);
        this.shadeSquare(this.shadeSquareDest);
    }
    
    onMoveEnd() {
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
            onMouseoverSquare: this.onMouseoverSquare,
            onMoveEnd: this.onMoveEnd
        };

        this.board = new ChessBoard('board', cfg);
        this.game = new Chess(); 

        //User has switched tabs and board just remounted
        if(this.props.fen) {
            this.board.position(this.props.fen);
            this.game.load(this.props.fen);
            
            //there is a pgn to get the prior moves
            if(this.props.pgn) {
                this.game.load_pgn(this.props.fen);
            }
            
            if(this.props.room.black._id === this.props.profile._id) {
                this.board.orientation('black');
            }
        }

        window.addEventListener('resize', (event) => {
            this.board.resize();
        });
    }

    render() {
        console.log("rendering two-board");
        console.log("shading "+this.shadeSquareSource+" and "+this.shadeSquareDest);
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
        fen: state.openThreads[state.activeThread].fen,
        pgn: state.openThreads[state.activeThread].pgn,
        room: state.openThreads[state.activeThread],
        name: state.activeThread,
    }
}

export default connect(mapStateToProps, {newMove}) (TwoBoard)
