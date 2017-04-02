import React, {Component} from 'react';
import { connect } from 'react-redux';
import {resign, draw, fourResign} from '../actions/room';

class GameButtons extends Component {

    constructor (props) {
        super(props);

        this.onResign = this.onResign.bind(this);
        this.onDraw = this.onDraw.bind(this);
        this.onFourResign = this.onFourResign.bind(this);
    }

    userIsPlaying(userObj, roomObj) {
        if(roomObj.white && userObj._id === roomObj.white.playerId) {
            return true;
        }
        if(roomObj.black && userObj._id === roomObj.black.playerId) {
            return true;
        }
        if(roomObj.gold && userObj._id === roomObj.gold.playerId) {
            return true;
        }
        if(roomObj.red && userObj._id === roomObj.red.playerId) {
            return true;
        }

        return false;
    }

    onResign(event) {
        this.props.resign(this.props.profile._id, this.props.activeThread);
    }

    onFourResign(event) {
        this.props.fourResign(this.props.activeThread);
    }

    onDraw(event) {
        this.props.draw(this.props.activeThread);
    }

    render() {
        const {activeThread, openThreads, profile} = this.props;

        if(!activeThread || !openThreads[activeThread]) {
            return <div></div>
        }

        const room = openThreads[activeThread];
        const {fen} = openThreads[activeThread];

        if(room.paused) {
            return <div></div>
        }

        if(!fen) {
            return <div></div>
        }

        if(!this.userIsPlaying(profile, room)) {
            return <div></div>
        }
        if(room.gameType == 'two-player' ||
           room.gameType == 'crazyhouse' ||
           room.gameType == 'crazyhouse960') {
            return (
                <div className="row">
                    <div className="center">
                        <div className="btn-group" role="group" aria-label="Basic example">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={this.onResign}>
                                Resign
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={this.onDraw}>
                                Send Draw Request
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if(room.gameType == 'four-player') {
            if(room.white && room.white.playerId == profile._id) {
                if(room.fen && room.white.resigned) {
                    return <div></div>
                }
            } else if( room.black && room.black.playerId == profile._id) {
                if(room.fen && room.black.resigned) {
                    return <div></div>
                }
            } else if( room.gold && room.gold.playerId == profile._id) {
                if(room.fen && room.gold.resigned) {
                    return <div></div>
                }
            } else if( room.red && room.red.playerId == profile._id) {
                if(room.fen && room.red.resigned) {
                    return <div></div>
                }
            }
            return (
                <div className="row">
                    <div className="center">
                        <div className="btn-group" role="group" aria-label="Basic example">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={this.onFourResign}>
                                Resign
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

function mapStateToProps(state) {

    return  {
        activeThread: state.activeThread,
        openThreads: state.openThreads,
        profile: state.auth.profile
    }

}

export default connect(mapStateToProps, {resign, draw, fourResign}) (GameButtons)
