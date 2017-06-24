import React, {Component} from 'react';
import {connect} from 'react-redux';

class RoomInfo extends Component {
    constructor() {
        super();
    }
    
    gameTypeString() {
        switch (this.props.gameType) {
            case 'four-player':
                return 'Four-Player';
            case 'standard':
                return 'Standard';
            case 'crazyhouse':
                return 'Crazyhouse';
            case 'crazyhouse960':
                return 'Crazyhouse 960';
            case 'schess':
                return 'S-Chess';
            case 'vrchess':
                return 'VR Chess';
        }
    }
    
    roomModeString() {
        switch (this.props.roomMode) {
            case 'open-table':
                return 'Open Table';
            case 'match':
                return 'Match';
        }
    }
    
    render() {
        let time_increment = this.props.time_increment ? this.props.time_increment : 0;
        return (
            <div className="col-xs-12">
                <div className="room-info-panel">
                    <div>
                        <span className="room-name">
                            {this.props.roomName}
                        </span>
                    </div>
                    <div>
                        <span className="time-control">
                            {this.props.time_base}+{time_increment}
                        </span>
                        <span className="separator">•</span>
                        <span className="game-type">
                            {this.gameTypeString()}
                        </span>
                    </div>
                    <div className="room-mode-wrapper">
                        <span className="room-mode">
                            {this.roomModeString()}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    let room = state.openThreads[state.activeThread];
    if (room) {
        let time_base = room.time.value;
        let time_increment = room.time.increment;
        let roomMode = room.room.roomMode;
        let gameType = room.gameType;
        let roomName = room.room.name;
        return {
            profile: state.auth.profile,
            room,
            time_base,
            time_increment,
            roomMode,
            gameType,
            roomName
        };
    }
    return {};
}

export default connect(mapStateToProps)(RoomInfo)