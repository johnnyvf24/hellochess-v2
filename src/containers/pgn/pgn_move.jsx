import React, {Component} from 'react';
import {connect} from 'react-redux';
import {changeActivePly} from '../../actions/room';

class PGNMove extends Component {
    constructor(props) {
        super(props);
    }
    
    shouldComponentUpdate(nextProps) {
        if (this.props.activePly != nextProps.activePly) {
            return true;
        }
        if (this.props.pgn.length != nextProps.pgn.length) {
            return true;
        }
        return false;
    }
    
    selectMove() {
        this.props.changeActivePly(this.props.room.room.name, this.props.move.ply);
    }
    
    render() {
        let className = "pgn-move";
        if (this.props.move.ply === this.props.activePly) {
            className += " active";
        }
        return (
            <div
                className={className}
                onClick={this.selectMove.bind(this)}>
                {this.props.move.san}
            </div>
        );
    }
    
}

function mapStateToProps(state, props) {
    let activeThread = state.activeThread;
    let room = state.openThreads[activeThread];
    let selectedMove = room.selectedMove;
    let game = room.game;
    let pgn = game.pgn;
    let activePly = room.activePly;
    return {
        activeThread: activeThread,
        room: room,
        selectedMove: selectedMove,
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

export default connect(mapStateToProps, mapDispatchToProps)(PGNMove);