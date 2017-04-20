import React, {Component} from 'react';
import {connect} from 'react-redux';
import {changeActivePly} from '../../actions/room';

class PGNNextButton extends Component {
    constructor(props) {
        super(props);
    }
    shouldComponentUpdate(nextProps) {
        return true;
    }
    onClick() {
        let roomName = this.props.room.room.name;
        let lastPly = this.props.pgn.length;
        let activePly;
        if (typeof this.props.activePly === "undefined") {
            activePly = lastPly;
        } else {
            activePly = this.props.activePly;
        }
        let nextPly = Math.min(lastPly, activePly + 1);
        this.props.changeActivePly(roomName, nextPly);
    }
    render() {
        return (
            <button
                className="pgn-next-button"
                onClick={this.onClick.bind(this)}>
                {'>'}
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

export default connect(mapStateToProps, mapDispatchToProps)(PGNNextButton);