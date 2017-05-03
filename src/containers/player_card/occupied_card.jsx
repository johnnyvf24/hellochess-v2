import React, {Component} from 'react';
import {connect} from 'react-redux';
import {tick, removeComputer} from '../../actions/room';
import {millisToMinutesAndSeconds, formatTurn, showElo} from '../../utils/index';
import { browserHistory } from 'react-router';

import {Panel, Row} from 'react-bootstrap';

class OccupiedCard extends Component {

    constructor(props) {
        super(props);
        this.countDown = null;
    };
    
    shouldComponentUpdate(nextProps) {
        if(nextProps.activeThread != this.props.activeThread) 
            return true;
        if(nextProps.game.fen != this.props.game.fen) {
            return true;
        }
        
        if(this.props.playerTime != nextProps.playerTime) {
            return true;
        }
        
        if (this.props.gameStarted != nextProps.gameStarted) {
            return true;
        }
        
        return false;
    }
    
    setTickTimer(props) {
        clearInterval(this.countDown);
        let updateInterval;
        if (props.playerTime < 10000) {
            updateInterval = 100;
        } else {
            updateInterval = 1000;
        }
        this.countDown = setInterval( () => {
            this.props.tick(this.props.room.room.name, props.turn)
        }, updateInterval);
    }

    componentWillReceiveProps(nextProps) {
        let gameJustStarted = !this.props.gameStarted && nextProps.gameStarted === true;
        let newTurnStarted = (this.props.turn !== nextProps.turn) && nextProps.gameStarted;;
        let isOurTurn = nextProps.turn === this.props.color;
        if (nextProps.gameStarted === false) {
            clearInterval(this.countDown);
        } else if (gameJustStarted || newTurnStarted) {
            if(isOurTurn) {
                this.setTickTimer(nextProps);
            } else {
                clearInterval(this.countDown);
            }
        } else if (nextProps.playerTime < 10000) {
            this.setTickTimer(nextProps);
        }
    }

    componentWillMount() {
        if(this.props.turn == this.props.color && this.props.gameStarted == true) {
            this.setTickTimer(this.props);
        } else if(this.props.gameStarted == false){
            clearInterval(this.countDown);
        }
    }

    componentWillUnmount() {
        clearInterval(this.countDown);
    }

    renderActiveBorder() {
        const {player, game, resigned, turn, color, longColor} = this.props;
        if (!player || !game || !turn || !game.gameStarted)
            return "";
        let isMyTurn = turn == color;
        let isResigned = resigned;
        let doDrawBorder = isMyTurn && !isResigned;
        return doDrawBorder ? " active" : "";
    }

    removeAi(player, roomName) {
        this.props.removeComputer(player, roomName);
    }
    
    enableMic(player, roomName) {
        this.props.enableMic(roomName);
    }
    
    disableMic(player, roomName) {
        this.props.disableMic(roomName);
    }
    renderLeaveSeat(player, roomName) {
        if(player.type == "computer") {
            return (
                <div className="pull-right">
                    <a href="#"
                        onClick={(event) => this.removeAi(player, roomName)}>
                        <i className="fa fa-times" aria-hidden="true"></i>
                    </a>
                </div>
            );
        }
    }
    
    renderEnableMicrophone(player, roomName) {
        
        if(player.playerId == this.props.profile._id) {
            if(!this.props.voice) {
                return (
                    <div className="pull-right">
                        <a href="#"
                            onClick={(event) => this.enableMic(player, roomName)}>
                            <i className="fa fa-microphone-slash" aria-hidden="true"></i> 
                        </a>
                    </div>
                );
            } else {
                return (
                    <div className="pull-right">
                        <a href="#"
                            onClick={(event) => this.disableMic(player, roomName)}>
                            <i className="fa fa-microphone" aria-hidden="true"></i> 
                        </a>
                    </div>
                );
            }
            
        }
    }

    renderTime(time) {
        return millisToMinutesAndSeconds(time);
    }

    // Alive = still playing
    // Dead = resigned or flagged
    // if dead, returns the className that will
    // indicate a dead player
    renderAliveIndicator() {
        const {player, longColor, gameStarted} = this.props;
        let className = "";
        if (gameStarted === true && player.alive === false) {
            className = longColor + "-dead";
        }
        return className;
    }

    render() {
        const {profile, room, game, player, time, playerTime, activeThread, gameStarted} = this.props;
        if(!profile || !room || !player || !game || !time || !playerTime || !activeThread) {
            return <div></div>
        }
        return (
            <div className={"player-card-border" + this.renderActiveBorder()}>
                <Panel className={"player-card occupied " + this.renderAliveIndicator() + " " + this.props.colorClass}>
                    { !gameStarted && this.renderLeaveSeat(player, activeThread)}
                    <Row>
                        <a href="#"
                            onClick={(e) => browserHistory.push(`/profile/${player.playerId}`)}
                            className="pull-left">
                            <img className="player-img img-circle" src={player.picture} />
                        </a>
                        <div className="player-sit-info"><h4>{player.username}</h4>{showElo(game, time, player)}</div>
                        <span className="pull-right player-time-info">
                            {this.renderTime(playerTime)}
                        </span>
                    </Row>

                </Panel>
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    let cardPlayer = props.longColor;
    return {
        fourplayer_ratings: state.auth.profile.fourplayer_ratings,
        standard_ratings: state.auth.profile.standard_ratings,
        profile: state.auth.profile,
        room: state.openThreads[state.activeThread],
        game: state.openThreads[state.activeThread].game,
        turn: state.openThreads[state.activeThread].game.turn,
        player: state.openThreads[state.activeThread].game[cardPlayer],
        time: state.openThreads[state.activeThread].time,
        playerTime: state.openThreads[state.activeThread].times[cardPlayer.charAt(0)],
        playerColor: cardPlayer,
        gameStarted: state.openThreads[state.activeThread].game.gameStarted,
        activeThread: state.activeThread
    }
}

export default connect(mapStateToProps, {tick, removeComputer})(OccupiedCard);
