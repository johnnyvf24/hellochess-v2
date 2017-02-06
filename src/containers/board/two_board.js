import React, {Component} from 'react';
import {connect} from 'react-redux';
import {newMove} from '../../actions/room';

class TwoBoard extends Component {

    constructor(props) {
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.game) {
            this.board.position(nextProps.game.fen(), false);

            if(nextProps.room.black._id === nextProps.profile._id) {
                this.board.orientation('black');
            } else {
                this.board.orientation('white');
            }
        } else {
            this.board.clear();
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

    onDrop(source, target) {
        let action = {
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        };

        // see if the move is legal
        let move = this.props.game.move(action);

        // illegal move
        if (move === null) return 'snapback';

        this.props.newMove(action, this.props.name);
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

        this.board = new ChessBoard('board', cfg);

        if(this.props.game) {
            this.board.position(this.props.game.fen());
            if(this.props.room.black._id === this.props.profile._id) {
                this.board.orientation('black');
            }
        }

        window.addEventListener('resize', (event) => {
            this.board.resize();
        });
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
    }
}

export default connect(mapStateToProps, {newMove}) (TwoBoard)
