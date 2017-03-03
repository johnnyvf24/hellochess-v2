import React, {Component} from 'react';
import {connect} from 'react-redux';
import {tick} from '../../../actions/room';
import {millisToMinutesAndSeconds, formatTurn, showElo} from '../../../utils/index';

class OnBlack extends Component {

    constructor(props) {
        super(props);

        this.countDown = null;
    };

    componentWillReceiveProps(nextProps) {
        if(nextProps.turn != this.props.turn
            && !nextProps.paused) {
            if(nextProps.turn == 'b') {
                this.countDown = setInterval( () => {
                    this.props.tick(nextProps.name, formatTurn(nextProps.turn))
                }, 1000);
            } else {
                clearInterval(this.countDown);
            }
        }
    }

    componentWillMount() {
        if(this.props.turn == 'b'
            && !this.props.paused) {
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

    renderTime(time) {
        return millisToMinutesAndSeconds(time);
    }

    render() {
        const {player, time, game} = this.props;
        if(!player || !time) {
            return <div></div>
        }
        return (
            <div className={"player-card-border" + this.renderActiveBorder()}>
                <div className="card player-card occupied">
                    <div className="card-block black-player">

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
        player: state.openThreads[state.activeThread].black,
        time: state.openThreads[state.activeThread].black.time,
        game: state.openThreads[state.activeThread],
        resigned: state.openThreads[state.activeThread].black.resigned,
        turn: state.openThreads[state.activeThread].turn,
        paused: state.openThreads[state.activeThread].paused,
        lastMove: state.openThreads[state.activeThread].lastMove,
        name: state.activeThread
    }
}

export default connect(mapStateToProps, {tick})(OnBlack);
