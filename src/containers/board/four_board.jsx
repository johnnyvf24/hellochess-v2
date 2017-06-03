import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fourNewMove} from '../../actions/room';
import FourChess from '../../../common/fourchess';
import {Howl} from 'howler'; // sound library
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
            pieceTheme: '/img/chesspieces/wikipedia/{piece}.png',
            moveSpeed: 'fast',
            onSnapbackEnd: this.onSnapbackEnd.bind(this),
            onMouseoutSquare: this.onMouseoutSquare,
            onMouseoverSquare: this.onMouseoverSquare
        };
        this.drag = {from: '', to: ''};
        this.atOldPosition = false;
        let soundVolume = 0.75;
        this.moveSound = new Howl({
            src: ['../audio/move.ogg'],
            volume: soundVolume
        });
        this.captureSound = new Howl({
            src: ['../audio/capture.ogg'],
            volume: soundVolume
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.name != this.props.name) {
            return true;
        } 
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.game.gameStarted === false && nextProps.game.gameStarted === true) {
            this.resetGame();
        }
        if (typeof nextProps.activePly !== "undefined" && nextProps.activePly != this.props.activePly) {
            // user clicked back or forward button on pgn
            this.loadPly(nextProps.activePly);
        }
        if (this.props.zoomLevel !== nextProps.zoomLevel) {
            this.boardRedraw();
        }
        if (nextProps.fen) {
            if (this.props.fen != nextProps.fen) {
                this.game.position(nextProps.fen);
                this.updatePosition(nextProps.fen);
            }

            let usColor = 'w';
            if(nextProps.game.gameStarted !== false && nextProps.game.white) {
                if(nextProps.game.white.playerId === nextProps.profile._id) {
                    this.board.orientation('white');
                    usColor = 'w';
                } else if(nextProps.game.black.playerId === nextProps.profile._id) {
                    this.board.orientation('black');
                    usColor = 'b';
                } else if(nextProps.game.gold.playerId === nextProps.profile._id) {
                    this.board.orientation('gold');
                    usColor = 'g';
                } else if(nextProps.game.red.playerId === nextProps.profile._id) {
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
                if (nextProps.room.game.turn === usColor) {
                    // make sure we're not moving another player's piece
                    // (this can happen when the premoved piece is captured;
                    // it then turns into the other player's piece and that
                    // piece would get moved)
                    if (this.premove && this.premove.piece.charAt(0) === usColor) {
                        this.executePremove();
                    } else {
                        this.resetPremove();
                    }
                }
            }

            if (this.props.pgn.length === nextProps.pgn.length - 1) {
                let enableSounds = JSON.parse(localStorage.getItem('enableSounds'));
                if (typeof enableSounds === "undefined" || enableSounds === null)
                    enableSounds = true;
                if (enableSounds) {
                    let lastMove = nextProps.pgn[nextProps.pgn.length-1];
                    if (lastMove.captured) {
                        this.captureSound.play();
                    } else {
                        this.moveSound.play();
                    }
                }
            }
        } else {
            this.resetGame();
        }
    }
    
    resetGame() {
        this.board.position('start', false);
        this.shadeSquareSource = null
        this.shadeSquareDest = null;
        this.game = new FourChess();
        if (this.prevMoveResizeListener) {
            window.removeEventListener('resize', this.prevMoveResizeListener);
        }
        this.prevMoveResizeListener = null;
        this.drag = {from: '', to: ''};
        this.boardRedraw(); // redraw the board to remove square shading
        this.atOldPosition = false;
    }
    
    loadPly(ply) {
        let moves = this.props.pgn;
        if (moves.length === 0) 
            return;
        if (ply === moves.length) {
            // the game is at the current move
            this.atOldPosition = false;
        } else if (ply > moves.length) {
            // changing to a new incoming move
            this.atOldPosition = false;
            return;
        } else {
            // set a flag so we know not to load any incoming
            // fen or overwrite the square highlights
            this.atOldPosition = true;
        }
        if (ply === 0) {
            this.board.resize();
            this.board.position('start', false);
        } else {
            // get the position at that move
            let move = moves[ply-1];
            let fen = move.fen;
            this.board.position(fen, false);
            if (ply) {
                this.board.resize();
                this.shadeSquare(move.from);
                this.shadeSquare(move.to);
            }
        }
    }
    
    updatePosition(fen) {
        if (!this.atOldPosition) {
            this.board.position(fen);
        }
        let turn = this.formatTurn(this.game.turn());
        if (this.drag.from) {
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
        
        if (this.atOldPosition) {
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
            return this.props.game.black.alive;

        } else if(this.props.profile._id === this.props.game.white.playerId) {
            //this is the white player
            if(piece.search(/^b/) !== -1 ||
               piece.search(/^g/) !== -1 ||
               piece.search(/^r/) !== -1) {
                return false;
            }
            return this.props.game.white.alive;
        } else if(this.props.profile._id === this.props.game.gold.playerId) {
            //this is the white player
            if(piece.search(/^b/) !== -1 ||
               piece.search(/^w/) !== -1 ||
               piece.search(/^r/) !== -1) {
                return false;
            }
            return this.props.game.gold.alive;
        } else if(this.props.profile._id === this.props.game.red.playerId) {
            //this is the white player
            if(piece.search(/^b/) !== -1 ||
               piece.search(/^g/) !== -1 ||
               piece.search(/^w/) !== -1) {
                return false;
            }
            return this.props.game.red.alive;
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
        if (!this.atOldPosition) {
            this.board.resize();
            this.shadeLastMove();
            this.renderPremove();
            this.drawHoverBorders();
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
        // see if the move is legal
        let move = this.game.move(action);
        this.resetPremove();
        if (move === null) {
            //this.game.undo();
        } else {
            this.props.fourNewMove(action, this.props.name, Date.now());
        }
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
        this.board.position(this.props.fen, false);
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

        this.props.fourNewMove(action, this.props.name, Date.now());
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
        if(this.props.game.fen) {
            this.board.position(this.props.game.fen);
            this.game.position(this.props.game.fen);
            if(this.props.game.black) {
                if(this.props.game.white.playerId === this.props.profile._id) {
                    this.board.orientation('white');
                }
                else if(this.props.game.black.playerId === this.props.profile._id) {
                    this.board.orientation('black');
                }
                else if(this.props.game.gold.playerId === this.props.profile._id) {
                    this.board.orientation('gold');
                }
                else if(this.props.game.red.playerId === this.props.profile._id) {
                    this.board.orientation('red');
                }
            }
        }
        if(this.props.fen) {
            this.board.position(this.props.fen);
        }
        window.addEventListener('resize', (event) => {
            this.boardRedraw();
        });
        this.boardRedraw();
        if(this.props.move) {
            this.shadeSquare(this.props.move.from);
            this.shadeSquare(this.props.move.to);
        }
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
    let pgn = game.pgn;
    let activePly = room.activePly;
    return {
        profile: profile,
        move: move,
        room: room,
        game: game,
        name: name,
        fen: fen,
        pgn: pgn,
        activePly: activePly,
        zoomLevel: state.settings.zoomLevel
    }
}

export default connect(mapStateToProps, {fourNewMove}) (FourBoard)
