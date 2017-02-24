import React, {Component} from 'react';
import {connect} from 'react-redux';

class OnRed extends Component {

    millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    showElo() {
        const {game, player} = this.props;
        let eloIndex, tcIndex;
        //this time estimate is based on an estimated game length of 35 moves
        let totalTimeMs = (game.time.value * 60 * 1000) + (35 * game.time.increment * 1000);

        //Two player cutoff times
        let twoMins = 120000;   //two minutes in ms
        let eightMins = 480000;
        let fifteenMins = 900000;

        //four player cutoff times
        let fourMins = 240000;
        let twelveMins = 720000;
        let twentyMins = 12000000;

        switch(game.gameType) {
            case 'two-player':
                eloIndex = 'two_elos';
                if( totalTimeMs <= twoMins) {
                    //bullet
                    tcIndex = 'bullet';
                } else if(totalTimeMs <= eightMins) {
                    //blitz
                    tcIndex = 'blitz';
                } else if(totalTimeMs <= fifteenMins) {
                    //rapid
                    tcIndex = 'rapid';
                } else {
                    //classical
                    tcIndex = 'classic';
                }
                return player[eloIndex][tcIndex];
            case 'four-player':
                eloIndex = 'four_elos';
                if( totalTimeMs <= fourMins) {
                    //bullet
                    tcIndex = 'bullet';
                } else if(totalTimeMs <= twelveMins) {
                    //blitz
                    tcIndex = 'blitz';
                } else if(totalTimeMs <= twentyMins) {
                    //rapid
                    tcIndex = 'rapid';
                } else {
                    //classical
                    tcIndex = 'classic';
                }
                return player[eloIndex][tcIndex];
        }
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

    render() {
        const {player, time, game} = this.props;
        if(!player || !time) {
            return <div></div>
        }
        return (
            <div className={"player-card-border" + this.renderActiveBorder()}>
                <div className="card player-card occupied">
                    <div className="card-block red-player">

                        <div className="row">
                            <img className="player-img rounded-circle" src={player.picture} />
                            <div className="card-text"><h5>{player.username}</h5>{this.showElo()}</div>
                        </div>

                        <h4 className="card-title pull-right">
                            {`${this.millisToMinutesAndSeconds(time)}`}
                        </h4>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        player: state.openThreads[state.activeThread].red,
        time: state.openThreads[state.activeThread].red.time,
        game: state.openThreads[state.activeThread],
        resigned: state.openThreads[state.activeThread].red.resigned,
        turn: state.openThreads[state.activeThread].turn
    }
}

export default connect(mapStateToProps)(OnRed);
