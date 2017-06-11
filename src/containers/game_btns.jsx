import React, {Component} from 'react';
import { connect } from 'react-redux';
import {resign, draw, fourResign, killAIs,
        abort, rematchOffer, rematchAccept, rematchCancel} from '../actions/room';
import Loading from 'react-loading-animation';

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
    
    userIsSeated(userObj, roomObj) {
        if(roomObj.game.white &&
            userObj._id === roomObj.game.white.playerId) {
            return true;
        }
        if(roomObj.game.black &&
            userObj._id === roomObj.game.black.playerId) {
            return true;
        }
        if(roomObj.game.gold &&
            userObj._id === roomObj.game.gold.playerId) {
            return true;
        }
        if(roomObj.game.red &&
            userObj._id === roomObj.game.red.playerId) {
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
    
    onRematchOffer(event) {
        this.props.rematchOffer(this.props.activeThread, this.props.profile._id);
    }
    
    onRematchAccept(event) {
        this.props.rematchAccept(this.props.activeThread);
    }
    
    onRematchCancel(event) {
        this.props.rematchCancel(this.props.activeThread);
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
    
    seatsFilled() {
        const game = this.props.room.game;
        if (game.numPlayers == 4) {
            return (
                game.white.playerId &&
                game.black.playerId &&
                game.red.playerId &&
                game.gold.playerId
            );
        } else {
            return (
                game.white.playerId &&
                game.black.playerId
            );
        }
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
    
    renderRematchButton() {
        const {profile, room} = this.props;
        let isMatch = this.props.roomMode === "match";
        let gameOver = this.props.gameStarted === false;
        let seatsFilled = this.seatsFilled();
        let isSeated = this.userIsSeated(profile, room);
        if (isMatch && gameOver && seatsFilled && isSeated) {
            if (this.props.rematchOffered) {
                if (this.props.rematchSenderId === this.props.profile._id) {
                    return this.cancelRematchButton();
                } else {
                    return this.acceptRematchButton();
                }
            } else {
                return this.rematchButton();
            }
        } else {
            return null;
        }
    }
    
    rematchButton() {
        return (
            <button
                type="button"
                className="btn btn-default rematch-button"
                onClick={this.onRematchOffer.bind(this)}>
                Rematch
            </button>
        );
    }
    
    acceptRematchButton() {
        return (
            <button
                type="button"
                className="btn btn-info rematch-button"
                onClick={this.onRematchAccept.bind(this)}>
                Accept Rematch
            </button>
        );
    }
    
    cancelRematchButton() {
        return (
            <button
                type="button"
                className="btn btn-default rematch-button"
                onClick={this.onRematchCancel.bind(this)}>
                <Loading height='30' width='30' />
                Cancel Rematch
            </button>
        );
    }

    render() {
        const {activeThread, openThreads, room, profile} = this.props;
        if (!activeThread || !openThreads[activeThread]) {
            return <div></div>
        }
        if (room.mode === 'analysis')
            return <div></div>;
        if (this.props.gameStarted == false) {
            return (
                <div className="game-buttons-wrapper">
                    <div className="game-buttons btn-group" role="group">
                        {this.renderRematchButton()}
                    </div>
                </div>
            );
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
    let room = state.openThreads[state.activeThread];
    if (room) {
        let roomMode = room.room.roomMode;
        let gameStarted = room.game.gameStarted;
        let rematchOffered = room.rematchOffered;
        let rematchSenderId = room.rematchSenderId;
        return  {
            activeThread: state.activeThread,
            openThreads: state.openThreads,
            room,
            roomMode,
            gameStarted,
            rematchOffered,
            rematchSenderId,
            profile: state.auth.profile
        }
    } else {
        return {
            activeThread: state.activeThread,
            room,
            openThreads: state.openThreads,
            profile: state.auth.profile
        }
    }

}

export default connect(
    mapStateToProps,
    {resign, draw, fourResign, killAIs, abort, rematchOffer, rematchAccept, rematchCancel}
) (GameButtons)
