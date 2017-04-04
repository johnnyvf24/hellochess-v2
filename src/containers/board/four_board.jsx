import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fourNewMove} from '../../actions/room';
import FourChess from '../../../common/fourchess';
import {DARK_SQUARE_HIGHLIGHT_COLOR, LIGHT_SQUARE_HIGHLIGHT_COLOR} from './board_wrapper.jsx'
import {DARK_SQUARE_PREMOVE_COLOR, LIGHT_SQUARE_PREMOVE_COLOR} from './board_wrapper.jsx'

class FourBoard extends Component {

    constructor(props) {
        super(props);

        this.onDrop = this.onDrop.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.shadeSquareSource = null;
        this.shadeSquareDest = null;
        this.prevMoveResizeListener = null;
        this.premove = null;
        this.boardEl = $('#board');
        this.cfg = {
            draggable: true,
            onDragStart: this.onDragStart,
            onDragMove: this.onDragMove,
            onDrop: this.onDrop,
            moveSpeed: 'fast',
            onMouseoutSquare: this.onMouseoutSquare,
            onMouseoverSquare: this.onMouseoverSquare
        };
        this.drag = {from: '', to: ''};
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.name != this.props.name) {
            return true;
        } 
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.fen) {
            if (this.props.fen != nextProps.fen) {
                this.game.position(nextProps.fen);
                this.updatePosition(nextProps.fen);
            }

            let usColor = 'w';
            if(this.props.room.paused === false && this.props.room.white) {
                if(nextProps.room.white.playerId === nextProps.profile._id) {
                    this.board.orientation('white');
                    usColor = 'w';
                } else if(nextProps.room.black.playerId === nextProps.profile._id) {
                    this.board.orientation('black');
                    usColor = 'b';
                } else if(nextProps.room.gold.playerId === nextProps.profile._id) {
                    this.board.orientation('gold');
                    usColor = 'g';
                } else if(nextProps.room.red.playerId === nextProps.profile._id) {
                    this.board.orientation('red');
                    usColor = 'r'
                }
            }
            

            if(nextProps.move) {
                this.shadeSquareSource = nextProps.move.from;
                this.shadeSquareDest = nextProps.move.to;
                this.boardRedraw(); // clear square shadings
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
                //TODO fourchess still doesn't have a load pgn feature
            }
        } else {
            this.board.clear();
            this.shadeSquareSource = null
            this.shadeSquareDest = null;
            this.game = new FourChess();
            if (this.prevMoveResizeListener) {
                window.removeEventListener('resize', this.prevMoveResizeListener);
            }
            this.prevMoveResizeListener = null;
            this.drag = {from: '', to: ''};
            this.boardRedraw(); // redraw the board to remove square shading
        }
    }
    
    updatePosition(fen) {
        this.board.position(fen);
        let turn = this.formatTurn(this.game.turn());
        if (this.drag.from && this.props.room[turn].playerId === this.props.profile._id) {
            // if the user is hovering a piece, delete it from the board position
            let pos = this.board.position();
            delete pos[this.drag.from];
            this.board.position(pos, false);
        }
    }

    onDragStart(source, piece, position, orientation) {

        if(!this.game) {
            return false;
        }
        
        if(!this.props.game.gameStarted) {
            return false;
        }
        
        if (!this.props.profile ||
            !this.props.game.black || !this.props.game.white ||
            !this.props.game.gold || !this.props.game.red) {
            return false;
        }

        if (this.props.profile._id === this.props.game.white.playerId ||
            this.props.profile._id === this.props.game.black.playerId ||
            this.props.profile._id === this.props.game.gold.playerId ||
            this.props.profile._id === this.props.game.red.playerId) {
                // only set the drag squares for the user that's playing
                this.drag.from = source;
                this.drag.to = source;
            }
            
        if(this.props.profile._id === this.props.game.black.playerId) {
            //this is the black player
            if(piece.search(/^w/) !== -1 ||
               piece.search(/^g/) !== -1 ||
               piece.search(/^r/) !== -1) {
                return false;
            }
            return true;

        } else if(this.props.profile._id === this.props.game.white.playerId) {
            //this is the white player
            if(piece.search(/^b/) !== -1 ||
               piece.search(/^g/) !== -1 ||
               piece.search(/^r/) !== -1) {
                return false;
            }
            return true;
        } else if(this.props.profile._id === this.props.game.gold.playerId) {
            //this is the white player
            if(piece.search(/^b/) !== -1 ||
               piece.search(/^w/) !== -1 ||
               piece.search(/^r/) !== -1) {
                return false;
            }
            return true;
        } else if(this.props.profile._id === this.props.game.red.playerId) {
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
    
    onDragMove(newSquare, oldSquare, source, piece, position) {
        // if it's not our turn, save which square we're dragging
        // from and to so we can restore the border highlight
        // when a move is made
        let turn = this.formatTurn(this.game.turn());
        if(this.props.game[turn].playerId !== this.props.profile._id) {
            this.drag = {from: source, to: newSquare};
        }
    }
    
    boardRedraw() {
        this.board.resize();
        this.shadeLastMove();
        this.renderPremove();
        this.drawHoverBorders();
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
            piece: this.premove.piece,
            promotion: 'q'
        };
        //this.game.move(action);
        //this.board.position(this.game.fen(), false);
        this.resetPremove();
        this.props.fourNewMove(action, this.props.name);
    }
    
    resetPremove() {
        if (this.premove) {
            this.boardEl.off('click', this.premove.clickListener);
        }
        this.premove = null;
        this.drag = {from: '', to: ''};
        this.boardRedraw();
    }
    
    onSnapbackEnd(piece, square, position, orientation) {
        if (!this.drag.from) {
            this.board.position(this.props.fen);
        }
    }
    
    onDrop(source, target, piece) {
        this.drag = {from: '', to: ''};
        let turn = this.formatTurn(this.game.turn());
        // see if the move is legal
        let action = {
            from: source,
            to: target,
            piece: piece,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        };
        if(this.props.game[turn].playerId !== this.props.profile._id) {
            if (source === target) {
                // reset premove when clicking on a piece
                this.resetPremove();
            } else {
                // set as premove
                this.setPremove(source, target, piece);
            }
            return 'snapback';
        }

        // make the move on the board
        let move = this.game.move(action);

        // illegal move
        if (move === null) return 'snapback';

        this.props.fourNewMove(action, this.props.name);
        this.shadeSquareSource = source;
        this.shadeSquareDest = target;
        this.shadeLastMove();
    }

/*
    onMoveEnd() {
        this.shadeLastMove();
    }
    */

    onMouseoutSquare() {

    }

    onMouseoverSquare() {

    }

    componentDidMount() {
        this.board = new FourChessBoard('board', this.cfg);
        this.game = new FourChess();

        window.addEventListener('resize', (event) => {
            this.boardRedraw();
        });
        if(this.props.fen) {
            this.board.position(this.props.fen);
            this.game.position(this.props.fen);
            if(this.props.black) {
                if(this.props.room.white.playerId === this.props.profile._id) {
                    this.board.orientation('white');
                }
                else if(this.props.room.black.playerId === this.props.profile._id) {
                    this.board.orientation('black');
                }
                else if(this.props.room.gold.playerId === this.props.profile._id) {
                    this.board.orientation('gold');
                }
                else if(this.props.room.red.playerId === this.props.profile._id) {
                    this.board.orientation('red');
                }
    
                if(this.props.move) {
                    this.shadeSquare(this.props.move.from);
                    this.shadeSquare(this.props.move.to);
                }
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
    let profile = state.auth.profile;
    let name = state.activeThread;
    let room = state.openThreads[name];
    let game = room.game;
    let move = game.move;
    let fen = game.fen;
    return {
        profile: profile,
        move: move,
        room: room,
        game: game,
        name: name,
        fen: fen
    }
}

export default connect(mapStateToProps, {fourNewMove}) (FourBoard)
