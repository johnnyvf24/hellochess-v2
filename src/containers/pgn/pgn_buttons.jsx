import React, {Component} from 'react';
import {connect} from 'react-redux';
import {changeActivePly} from '../../actions/room';
import PGNFirstButton from './pgn_first_button';
import PGNPrevButton from './pgn_prev_button';
import PGNNextButton from './pgn_next_button';
import PGNLastButton from './pgn_last_button';

class PGNButtons extends Component {

    constructor(props) {
        super(props);
    };
    
    shouldComponentUpdate(nextProps) {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        
    }

    componentWillMount() {
    }

    render() {
        let roomName = this.props.room.room.name;
        return (
            <div className="pgn-buttons">
                <PGNFirstButton />
                <PGNPrevButton />
                <PGNNextButton />
                <PGNLastButton />
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(PGNButtons);
