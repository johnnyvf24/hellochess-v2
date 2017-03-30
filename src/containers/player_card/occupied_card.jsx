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

    componentWillReceiveProps(nextProps) {
        if(nextProps.turn != this.props.turn
            && !nextProps.paused) {
            if(nextProps.turn == this.props.color) {
                clearInterval(this.countDown);
                this.countDown = setInterval( () => {
                    this.props.tick(nextProps.name, formatTurn(nextProps.turn))
                }, 1000);
            } else {
                clearInterval(this.countDown);
            }
        } else if(nextProps.paused) {
            clearInterval(this.countDown);
        }
    }

    componentWillMount() {
        if(this.props.turn == this.props.color && !this.props.paused) {
            clearInterval(this.countDown);
            this.countDown = setInterval( () => {
                this.props.tick(this.props.name, formatTurn(this.props.turn))
            }, 1000);
        } else {
            clearInterval(this.countDown);
        }
    }

    componentWillUnmount() {
        clearInterval(this.countDown);
    }

    renderActiveBorder() {
        const {player, game, resigned, turn, color, longColor} = this.props;
        console.log("renderActiveBorder: player:", player,"game:",game,"turn:",turn);
        if (!player || !game || !turn)
            return "";
        let isMyTurn = turn == color;
        let isResigned = resigned;
        let doDrawBorder = isMyTurn && !isResigned;
        return doDrawBorder ? " active" : "";
    }

    removeAi(player, roomName) {
        this.props.removeComputer(player, roomName);
    }

    renderLeaveSeat(player, roomName) {
        if(player.type) {
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

    renderTime(time) {
        return millisToMinutesAndSeconds(time);
    }

    // Alive = still playing
    // Dead = resigned or flagged
    // if dead, returns the className that will
    // indicate a dead player
    renderAliveIndicator() {
        const {alive, longColor} = this.props;
        let className = "";
        if (alive === false) {
            className = longColor + "-dead";
        }
        return className;
    }

    render() {
        const {player, time, game, name} = this.props;
        if(!player || !time) {
            return <div></div>
        }
        return (
            <div className={"player-card-border" + this.renderActiveBorder()}>
                <Panel className={"player-card occupied " + this.renderAliveIndicator() + " " + this.props.colorClass}>
                    { !game.fen && this.renderLeaveSeat(player, name)}

                    <Row>
                        <a href="#"
                            onClick={(e) => browserHistory.push(`/profile/${player.playerId}`)}
                            className="pull-left">
                            <img className="player-img img-circle" src={player.picture} />
                        </a>
                        <div className="player-sit-info"><h4>{player.username}</h4>{showElo(game, player)}</div>
                        <span className="pull-right player-time-info">
                            {this.renderTime(time)}
                        </span>
                    </Row>

                    
                </Panel>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    let color = ownProps.longColor;
    let game = state.openThreads[state.activeThread];
    let player = game[color];
    let time = game.times[ownProps.color];
    return {
        player: player,
        time: time,
        game: game,
        resigned: player.resigned,
        turn: game.turn,
        paused: game.paused,
        lastMove: game.lastMove,
        name: state.activeThread,
        alive: player.alive,
        color: ownProps.color,
        longColor: ownProps.longColor
    }
}

export default connect(mapStateToProps, {tick, removeComputer})(OccupiedCard);
