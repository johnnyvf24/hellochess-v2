import React, {Component} from 'react';
import {connect} from 'react-redux';
import {changeActivePly} from '../../actions/room';
import {Button} from 'react-bootstrap';

class PGNFirstButton extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        $(document).on('keydown', this.onArrowKey.bind(this));
    }
    onArrowKey(event) {
        let keyCode = '38'; // up arrow
        let tag = event.target.tagName.toLowerCase();
        if (event.which == keyCode && tag !== 'input') {
            this.onClick();
        }
    }
    onClick() {
        let roomName = this.props.room.room.name;
        this.props.changeActivePly(roomName, 0);
    }
    disabled() {
        return (
            typeof this.props.activePly === "undefined" ||
            this.props.activePly === 0
        );
    }
    render() {
        return (
            <Button
                className="pgn-first-button"
                bsSize="xsmall"
                disabled={this.disabled()}
                onClick={this.onClick.bind(this)}>
                {'<<'}
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

export default connect(mapStateToProps, mapDispatchToProps)(PGNFirstButton);