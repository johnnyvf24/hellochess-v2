import React, {Component} from 'react';
import {connect} from 'react-redux';
import {updateTime, removeComputer} from '../../actions/room';
import {formatTurn, showElo} from '../../utils/index';
import { browserHistory } from 'react-router';
import Clock from '../../../common/Clock';

import {Panel, Row} from 'react-bootstrap';

class OccupiedCard extends Component {

    constructor(props) {
        super(props);
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
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.gameStarted === false) {
            this.clock.pause();
        } else {
            let isOurTurn = nextProps.turn === this.props.color;
            let shouldClocksStart = this.props.moveNum >= this.props.numPlayers - 1;
            if(isOurTurn && nextProps.gameStarted === true && shouldClocksStart) {
                this.clock.start(this.props.playerTime);
            } else {
                this.clock.pause();
            }
        }
    }
    
    updateTime(timeLeft) {
        this.props.updateTime(this.props.room.room.name, this.props.playerColor.charAt(0), timeLeft);
    }

    componentDidMount() {
        let initialTime;
        if (this.props.gameStarted) {
            initialTime = this.props.playerTime;
        } else {
            initialTime = this.props.time.value * 60 * 1000;
        }
        this.clock = new Clock(initialTime, this.props.time.increment);
        this.clock.onTick(this.updateTime.bind(this));
        let shouldClocksStart = this.props.moveNum >= this.props.numPlayers - 1;
        if(this.props.turn == this.props.color && this.props.gameStarted == true && shouldClocksStart) {
            this.clock.start();
        } else if(this.props.gameStarted == false){
            this.clock.pause();
        }
    }

    componentWillUnmount() {
        this.clock.pause();
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
        return Clock.parse(time);
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
    
    renderPlayerScore() {
        if (this.props.room.room.roomMode === "match") {
            let id = this.props.player.playerId;
            let score = this.props.room.playerScores[id];
            console.log("player:", this.props.player);
            console.log(id, "score:", score);
            return (
                <span className="player-score">
                    {score}
                </span>
            );
        }
    }

    render() {
        const {profile, room, game, time, playerTime, activeThread, gameStarted} = this.props;
        let {player} = this.props;
        if(!profile || !room || !player || !game || !time || !activeThread) {
            return <div></div>
        }
        if(room.mode === 'analysis') {
            player = player.user_id;
            player.playerId = player._id;
        }
        return (
            <div className={"player-card-border" + this.renderActiveBorder()}>
                <Panel className={"player-card occupied " + this.renderAliveIndicator() + " " + this.props.colorClass}>
                    {this.renderPlayerScore()}
                    { !gameStarted && this.renderLeaveSeat(player, activeThread)}
                    <Row>
                        <a href="#"
                            onClick={(e) => browserHistory.push(`/profile/${player.playerId}`)}
                            className="pull-left">
                            <img className="player-img img-circle" src={player.picture} />
                        </a>
                        <div className="player-sit-info">
                            <h4
                                className="player-username"
                                title={player.username}>
                                {player.username}
                            </h4>
                            <div className="player-elo">
                                {showElo(game, time, player)}
                            </div>
                        </div>
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
        profile: state.auth.profile,
        room: state.openThreads[state.activeThread],
        game: state.openThreads[state.activeThread].game,
        turn: state.openThreads[state.activeThread].game.turn,
        player: state.openThreads[state.activeThread].game[cardPlayer],
        time: state.openThreads[state.activeThread].time,
        playerTime: state.openThreads[state.activeThread].times[cardPlayer.charAt(0)],
        playerColor: cardPlayer,
        gameStarted: state.openThreads[state.activeThread].game.gameStarted,
        moveNum: state.openThreads[state.activeThread].game.pgn.length,
        numPlayers: state.openThreads[state.activeThread].game.numPlayers,
        activeThread: state.activeThread
    }
}

export default connect(mapStateToProps, {updateTime, removeComputer})(OccupiedCard);
