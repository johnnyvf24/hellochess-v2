import React, {Component} from 'react';
import { connect } from 'react-redux';
import {resign, draw, fourResign, killAIs, abort} from '../actions/room';

class GameButtons extends Component {

    constructor (props) {
        super(props);

        this.onResign = this.onResign.bind(this);
        this.onDraw = this.onDraw.bind(this);
        this.onFourResign = this.onFourResign.bind(this);
    }

    userIsPlaying(userObj, roomObj) {
        if(roomObj.game.white &&
            userObj._id === roomObj.game.white.playerId &&
            roomObj.game.white.alive) {
            return true;
        }
        if(roomObj.game.black &&
            userObj._id === roomObj.game.black.playerId &&
            roomObj.game.black.alive) {
            return true;
        }
        if(roomObj.game.gold &&
            userObj._id === roomObj.game.gold.playerId &&
            roomObj.game.gold.alive) {
            return true;
        }
        if(roomObj.game.red &&
            userObj._id === roomObj.game.red.playerId &&
            roomObj.game.red.alive) {
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
    
    onAbort(event) {
        this.props.abort(this.props.activeThread);
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
    
    renderResignButton() {
        let resignAction;
        if (this.props.room.gameType === "four-player") {
            resignAction = this.onFourResign.bind(this);
        } else {
            resignAction = this.onResign.bind(this);
        }
        return (
            <button
                type="button"
                className="btn btn-secondary"
                onClick={resignAction}>
                Resign
            </button>
        );
    }
    
    renderDrawButton() {
        let room = this.props.room;
        if(room.gameType == 'standard' ||
           room.gameType == 'crazyhouse' ||
           room.gameType == 'crazyhouse960') {
            return (
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={this.onDraw.bind(this)}>
                    Offer Draw
                </button>
            );
        } else {
            return null;
        }
    }
    
    renderAbortButton() {
        return (
            <button
                type="button"
                className="btn btn-secondary"
                onClick={this.onAbort.bind(this)}>
                Abort
            </button>
        );
    }
    
    renderAbortResignButton() {
        // render the abort button until the game can no longer
        // be aborted, then render the resign button
        if (this.props.room.game.pgn.length < this.props.room.game.numPlayers) {
            return this.renderAbortButton();
        } else {
            return this.renderResignButton();
        }
    }

    render() {
        const {activeThread, openThreads, profile} = this.props;
        if (!activeThread || !openThreads[activeThread]) {
            return <div></div>
        }
        const room = openThreads[activeThread];
        if (room.game.gameStarted == false) {
            return <div></div>
        }
        if (this.onlyAIs(room.game)) {
            return (
                <div className="game-buttons-wrapper">
                    <div className="game-buttons btn-group" role="group">
                        <button type="button"
                            className="btn btn-secondary"
                            onClick={this.killAIs.bind(this)}>
                            Stop AI Game
                        </button>
                    </div>
                </div>);
        }
        if (!this.userIsPlaying(profile, room)) {
            return <div></div>
        }
        return (
            <div className="game-buttons-wrapper">
                <div className="game-buttons btn-group" role="group">
                    {this.renderAbortResignButton()}
                    {this.renderDrawButton()}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {

    return  {
        activeThread: state.activeThread,
        openThreads: state.openThreads,
        room: state.openThreads[state.activeThread],
        profile: state.auth.profile
    }

}

export default connect(mapStateToProps, {resign, draw, fourResign, killAIs, abort}) (GameButtons)
