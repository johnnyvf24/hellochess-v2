import React, {Component} from 'react';
import {connect} from 'react-redux';
import {tick, removeComputer} from '../../actions/room';
import {millisToMinutesAndSeconds, formatTurn, showElo} from '../../utils/index';
import { browserHistory } from 'react-router';

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
        const {player, game, resigned, turn} = this.props;

        if (!player || !game)
            return "";
        let isMyTurn = turn == player.color;
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
                <div className={"card player-card occupied " + this.renderAliveIndicator()}>
                    <div className={"card-block " + this.props.colorClass + " " + this.renderAliveIndicator()}>
                        { !game.fen && this.renderLeaveSeat(player, name)}

                        <div className="row">
                            <a href="#"
                                onClick={(e) => browserHistory.push(`/profile/${player._id}`)}>
                                <img className="player-img rounded-circle" src={player.picture} />
                            </a>
                            <div className="card-text"><h5>{player.username}</h5>{showElo(game, player)}</div>
                        </div>

                        <h4 className="card-title pull-right">
                            {this.renderTime(time)}
                        </h4>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    let color = ownProps.longColor;
    return {
        player: state.openThreads[state.activeThread][color],
        time: state.openThreads[state.activeThread][color].time,
        game: state.openThreads[state.activeThread],
        resigned: state.openThreads[state.activeThread][color].resigned,
        turn: state.openThreads[state.activeThread].turn,
        paused: state.openThreads[state.activeThread].paused,
        lastMove: state.openThreads[state.activeThread].lastMove,
        name: state.activeThread,
        alive: state.openThreads[state.activeThread][color].alive
    }
}

export default connect(mapStateToProps, {tick, removeComputer})(OccupiedCard);
