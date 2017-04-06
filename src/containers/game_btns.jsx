import React, {Component} from 'react';
import { connect } from 'react-redux';
import {resign, draw, fourResign, killAIs} from '../actions/room';

class GameButtons extends Component {

    constructor (props) {
        super(props);

        this.onResign = this.onResign.bind(this);
        this.onDraw = this.onDraw.bind(this);
        this.onFourResign = this.onFourResign.bind(this);
    }

    userIsPlaying(userObj, roomObj) {
        if(roomObj.game.white && userObj._id === roomObj.game.white.playerId) {
            return true;
        }
        if(roomObj.game.black && userObj._id === roomObj.game.black.playerId) {
            return true;
        }
        if(roomObj.game.gold && userObj._id === roomObj.game.gold.playerId) {
            return true;
        }
        if(roomObj.game.red && userObj._id === roomObj.game.red.playerId) {
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
    
    killAIs(event) {
        this.props.killAIs(this.props.activeThread);
    }
    
    onlyAIs(gameObj) {
        if(gameObj.white && gameObj.white.alive && gameObj.white.type != 'computer') {
            return false;
        }
        if(gameObj.black && gameObj.black.alive &&  gameObj.black.type != 'computer') {
            return false;
        }
        if(gameObj.gold && gameObj.gold.alive && gameObj.gold.type != 'computer') {
            return false;
        }
        if(gameObj.red && gameObj.red.alive && gameObj.red.type != 'computer') {
            return false;
        }
        return true;
    }

    render() {
        const {activeThread, openThreads, profile} = this.props;

        if(!activeThread || !openThreads[activeThread]) {
            return <div></div>
        }

        const room = openThreads[activeThread];
        
        if(room.game.gameStarted == false) {
            return <div></div>
        }

        if(this.onlyAIs(room.game)) {
            return (<div><button type="button"
                    className="btn btn-secondary"
                    onClick={this.killAIs.bind(this)}>
                    Stop AI Game
                </button></div>);
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
                                onClick={this.onResign.bind(this)}>
                                Resign
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={this.onDraw.bind(this)}>
                                Send Draw Request
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if(room.gameType == 'four-player') {
            
            if(room.game.white && room.game.white.playerId == profile._id) {
                if(!room.game.gameStarted || !room.game.white.alive) {
                    return <div></div>
                }
            } else if( room.game.black && room.game.black.playerId == profile._id) {
                if( !room.game.gameStarted || !room.game.black.alive) {
                    return <div></div>
                }
            } else if( room.game.gold && room.game.gold.playerId == profile._id) {
                if(!room.game.gameStarted || !room.game.gold.alive) {
                    return <div></div>
                }
            } else if( room.game.red && room.game.red.playerId == profile._id) {
                if(!room.game.gameStarted || !room.game.red.alive) {
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

export default connect(mapStateToProps, {resign, draw, fourResign, killAIs}) (GameButtons)
