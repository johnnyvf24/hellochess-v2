import React, {Component} from 'react';
import {connect} from 'react-redux';
import {changeActivePly} from '../../actions/room';
import {Button} from 'react-bootstrap';

class PGNPrevButton extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.bindArrowKey();
    }
    componentDidUpdate() {
        this.bindArrowKey();
    }
    componentWillUnmount() {
        $(document).off('keydown');
    }
    bindArrowKey() {
        $(document).on('keydown', this.onArrowKey.bind(this));
    }
    onArrowKey(event) {
        let keyCode = '37'; // left arrow
        let tag = event.target.tagName.toLowerCase();
        if (event.which == keyCode && tag !== 'input') {
            this.onClick();
            event.preventDefault();
            event.stopImmediatePropagation();
            return false;
        }
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
        let prevPly = Math.max(0, activePly - 1);
        this.props.changeActivePly(roomName, prevPly);
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
                className="pgn-prev-button"
                bsSize="xsmall"
                disabled={this.disabled()}
                onClick={this.onClick.bind(this)}>
                {'<'}
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

export default connect(mapStateToProps, mapDispatchToProps)(PGNPrevButton);