import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fourNewMove} from '../../actions/room';

class FourBoard extends Component {

    constructor(props) {
        super(props);

        this.onDrop = this.onDrop.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillReceiveProps(nextProps) {

        if(nextProps.game) {
            this.board.position(nextProps.fen);

            if(nextProps.room.white._id === nextProps.profile._id) {
                this.board.orientation('white');
            } else if(nextProps.room.black._id === nextProps.profile._id) {
                this.board.orientation('black');
            } else if(nextProps.room.gold._id === nextProps.profile._id) {
                this.board.orientation('gold');
            } else if(nextProps.room.red._id === nextProps.profile._id) {
                this.board.orientation('red');
            }
        } else {
            this.board.clear();
        }
    }

    onDragStart(source, piece, position, orientation) {

        if(this.props.room.paused) {
            return false;
        }

        if(!this.props.game) {
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

    onDrop(source, target) {
        let turn = this.formatTurn(this.props.game.turn());

        if(this.props.room[turn]._id !== this.props.profile._id) {
            return 'snapback';
        }

        let action = {
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        };

        // see if the move is legal
        let move = this.props.game.move(action);

        // illegal move
        if (move === null) return 'snapback';

        this.props.fourNewMove(action, this.props.name);
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
        };

        this.board = new FourChessBoard('board', cfg);

        window.addEventListener('resize', (event) => {
            this.board.resize();
        });

        if(this.props.game && this.props.fen) {
            this.board.position(this.props.fen);
            if(this.props.room.black._id === this.props.profile._id) {
                this.board.orientation('black');
            }
            else if(this.props.room.gold._id === this.props.profile._id) {
                this.board.orientation('gold');
            }
            else if(this.props.room.red._id === this.props.profile._id) {
                this.board.orientation('red');
            }
        }
    }

    render() {
        return (
            <div id="board"></div>
        );
    }

}

function mapStateToProps(state) {
    return {
        profile: state.auth.profile,
        game: state.openThreads[state.activeThread].game,
        room: state.openThreads[state.activeThread],
        name: state.activeThread,
        fen: state.openThreads[state.activeThread].fen
    }
}

export default connect(mapStateToProps, {fourNewMove}) (FourBoard)
