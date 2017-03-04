import React, {Component} from 'react';
import {connect} from 'react-redux';
import {tick, removeComputer} from '../../../actions/room';
import {millisToMinutesAndSeconds, formatTurn, showElo} from '../../../utils/index';

class OnWhite extends Component {

    constructor(props) {
        super(props);

        this.countDown = null;
    };

    componentWillReceiveProps(nextProps) {
        if(nextProps.turn != this.props.turn
            && !nextProps.paused) {
            if(nextProps.turn == 'w') {
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
        if(this.props.turn == 'w' && !this.props.paused) {
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

    render() {
        const {player, time, game, name} = this.props;
        if(!player || !time) {
            return <div></div>
        }
        return (
            <div className={"player-card-border" + this.renderActiveBorder()}>
                <div className="card player-card occupied">
                    <div className="card-block">
                        { !game.fen && this.renderLeaveSeat(player, name)}

                        <div className="row">
                            <img className="player-img rounded-circle" src={player.picture} />
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

function mapStateToProps(state) {
    return {
        player: state.openThreads[state.activeThread].white,
        time: state.openThreads[state.activeThread].white.time,
        game: state.openThreads[state.activeThread],
        resigned: state.openThreads[state.activeThread].white.resigned,
        turn: state.openThreads[state.activeThread].turn,
        paused: state.openThreads[state.activeThread].paused,
        lastMove: state.openThreads[state.activeThread].lastMove,
        name: state.activeThread
    }
}

export default connect(mapStateToProps, {tick, removeComputer})(OnWhite);
