import React, {Component} from 'react';
import {connect} from 'react-redux';
import {changeActivePly} from '../../actions/room';
import {Button} from 'react-bootstrap';

class PGNLastButton extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        $(document).on('keydown', this.onArrowKey.bind(this));
    }
    onArrowKey(event) {
        let keyCode = '40'; // down arrow
        let tag = event.target.tagName.toLowerCase();
        if (event.which == keyCode && tag !== 'input') {
            this.onClick();
        }
    }
    onClick() {
        let roomName = this.props.room.room.name;
        let lastPly = this.props.pgn.length;
        this.props.changeActivePly(roomName, lastPly);
    }
    disabled() {
        return (
            typeof this.props.activePly === "undefined" ||
            this.props.activePly === this.props.pgn.length
        );
    }
    render() {
        return (
            <Button
                className="pgn-last-button"
                bsSize="xsmall"
                disabled={this.disabled()}
                onClick={this.onClick.bind(this)}>
                {'>>'}
            </Button>
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