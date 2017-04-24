import React, {Component} from 'react';
import {connect} from 'react-redux';
import {changeActivePly} from '../../actions/room';

class PGNLastButton extends Component {
    constructor(props) {
        super(props);
    }
    onClick() {
        let roomName = this.props.room.room.name;
        let lastPly = this.props.pgn.length;
        this.props.changeActivePly(roomName, lastPly);
    }
    render() {
        return (
            <button
                className="pgn-last-button"
                onClick={this.onClick.bind(this)}>
                {'>>'}
            </button>
        );
    }
    
}
function mapStateToProps(state, props) {
    let activeThread = state.activeThread;
    let room = state.openThreads[activeThread];
    let game = room.game;
    let pgn = game.pgn;
    let activePly = room.activePly;
    return {
        activeThread: activeThread,
        room: room,
        game: game,
        pgn: pgn,
        activePly: activePly
    }
}

function mapDispatchToProps(dispatch) {
    return {
        changeActivePly: (roomName, ply) => {
            dispatch(changeActivePly(roomName, ply))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PGNLastButton);