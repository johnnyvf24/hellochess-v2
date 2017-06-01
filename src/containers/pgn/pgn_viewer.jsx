import React, {Component} from 'react';
import {connect} from 'react-redux';
import PGNButtons from './pgn_buttons';
import PGNMoveList from './pgn_move_list';
import {changeActivePly} from '../../actions/room';

class PGNViewer extends Component {

    constructor(props) {
        super(props);
    };
    
    shouldComponentUpdate(nextProps) {
        if(nextProps.activeThread != this.props.activeThread) 
            return true;
        if(nextProps.game.fen != this.props.game.fen) {
            return true;
        }
        if (nextProps.pgn != this.props.pgn) {
            return true;
        }
        if (nextProps.activePly != this.props.activePly) {
            return true;
        }
        return false;
    }

    componentWillReceiveProps(nextProps) {
        
    }

    componentWillMount() {
        if (this.props.pgn) {
            
        }
    }

    render() {
        let moves = this.props.pgn;
        
        /*
        moves = ['e4', 'e5',
                 'Nf3', 'Nc6',
                 'Bb5', 'a6',
                 'Ba4', 'Nf6',
                 'O-O', 'O-O',
                 'Re1', 'b5',
                 'Bb3', 'd6',
                 'c3', 'h6',
                 'h3', 'c5',
                 'd5'];
         */
        let numPlys = moves.length;
        return (
            <div className="pgn-viewer">
                <PGNMoveList />
                <PGNButtons numPlys={numPlys}/>
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    let activeThread = state.activeThread;
    let room = state.openThreads[activeThread];
    let game = room.game;
    let pgn = game.pgn;
    let activePly = state.activePly;
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

export default connect(mapStateToProps, mapDispatchToProps)(PGNViewer);
