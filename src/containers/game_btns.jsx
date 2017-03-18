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
        if(roomObj.white && userObj._id === roomObj.white._id) {
            return true;
        }
        if(roomObj.black && userObj._id === roomObj.black._id) {
            return true;
        }
        if(roomObj.gold && userObj._id === roomObj.gold._id) {
            return true;
        }
        if(roomObj.red && userObj._id === roomObj.red._id) {
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

        const {fen} = openThreads[activeThread];

        if(openThreads[activeThread].paused) {
            return <div></div>
        }

        if(!fen) {
            return <div></div>
        }

        if(!this.userIsPlaying(profile, openThreads[activeThread])) {
            return <div></div>
        }

        if(openThreads[activeThread].gameType == 'two-player' ||
           openThreads[activeThread].gameType == 'crazyhouse') {
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
        } else if(openThreads[activeThread].gameType == 'four-player') {
            if(openThreads[activeThread].white && openThreads[activeThread].white._id == profile._id) {
                if(openThreads[activeThread].fen && openThreads[activeThread].white.resigned) {
                    return <div></div>
                }
            } else if( openThreads[activeThread].black && openThreads[activeThread].black._id == profile._id) {
                if(openThreads[activeThread].fen && openThreads[activeThread].black.resigned) {
                    return <div></div>
                }
            } else if( openThreads[activeThread].gold && openThreads[activeThread].gold._id == profile._id) {
                if(openThreads[activeThread].fen && openThreads[activeThread].gold.resigned) {
                    return <div></div>
                }
            } else if( openThreads[activeThread].red && openThreads[activeThread].red._id == profile._id) {
                if(openThreads[activeThread].fen && openThreads[activeThread].red.resigned) {
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
