import React, { Component } from 'react'
import {connect} from 'react-redux';
import BrowserNotification from '../components/room/browser_notification';

class NotificationHandler extends Component {
    constructor(props) {
        super(props);
    }
    
    componentWillReceiveProps(nextProps) {
        let gameStarting = this.props.gameStarted === false && nextProps.gameStarted === true;
        let userIsPlaying = this.userIsPlaying(nextProps);
        let tabHasFocus = this.tabHasFocus();
        if (gameStarting && userIsPlaying && !tabHasFocus) {
            this.ignore = false;
            this.title = "Game started";
            this.body = `Your game in room ${this.props.room.room.name} has started!`;
            this.options = {
                body: this.body
            };
        }
    }
    
    userIsPlaying(props) {
        let colors = ['white', 'black', 'gold', 'red'];
        if (typeof props.game === "undefined") {
            return false;
        }
        return colors.some((color) => {
            if (typeof props.game[color] !== "undefined") {
                if (props.game[color].playerId === props.profile._id) {
                    return true;
                }
            }
        });
    }
    
    tabHasFocus() {
        let hidden = hidden;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
        }
        return !(document[hidden]);
    }
    
    render() {
        return (
            <BrowserNotification
                ignore={this.ignore}
                title={this.title}
                options={this.options}
            />
        );
    }
}

function mapStateToProps(state) {
    let profile = state.auth.profile;
    let name = state.activeThread;
    let room = state.openThreads[name];
    let game, move, fen, pgn, gameStarted, activePly;
    if (typeof room !== "undefined") {
        game = room.game;
        move = game.move;
        fen = game.fen;
        pgn = game.pgn;
        gameStarted = game.gameStarted;
        activePly = room.activePly;
    }
    return {
        profile: profile,
        move: move,
        room: room,
        game: game,
        name: name,
        fen: fen,
        pgn: pgn,
        gameStarted: gameStarted,
        activePly: activePly
    }
}


export default connect(mapStateToProps) (NotificationHandler)