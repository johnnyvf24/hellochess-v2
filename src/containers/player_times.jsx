import React, {Component} from 'react';
import {connect} from 'react-redux';
import PlayerCard from '../components/player_card/player_card';

class PlayerTimes extends Component {
    constructor(props) {
        super(props);

        this.renderWhitePlayer = this.renderWhitePlayer.bind(this);
        this.renderBlackPlayer = this.renderBlackPlayer.bind(this);
        this.renderGoldPlayer = this.renderGoldPlayer.bind(this);
        this.renderRedPlayer = this.renderRedPlayer.bind(this);
    }

    renderWhitePlayer(thread) {
        let time = 0, player = undefined;
        if(thread.white) {
            player = thread.white;
            time = thread.white.time;
        } else {
            player = undefined;
            time = thread.time;
        }

        return <PlayerCard player={player} time={time} color="w"/>
    }

    renderBlackPlayer(thread) {

        let time = 0, player = undefined;
        if(thread.black) {
            player = thread.black;
            time = thread.black.time;
        } else {
            player = undefined;
            time = thread.time;
        }

        return <PlayerCard player={player} time={time} color="b"/>
    }

    renderGoldPlayer(thread) {
        let time = 0, player = undefined;
        if(thread.gold) {
            player = thread.gold;
            time = thread.gold.time;
        } else {
            player = undefined;
            time = thread.time;
        }

        return <PlayerCard player={player} time={time} color="g"/>
    }

    renderRedPlayer(thread) {
        let time = 0, player = undefined;
        if(thread.red) {
            player = thread.red;
            time = thread.red.time;
        } else {
            player = undefined;
            time = thread.time;
        }

        return <PlayerCard  player={player} time={time} color="r"/>
    }

    render() {
        let {activeThread, openThreads, profile} = this.props;
        activeThread = openThreads[activeThread];
        if(!openThreads || !activeThread) {
            return <div>Ad HERE!</div>
        }

        if(activeThread.gameType === "four-player") {
            return (
                <div>
                    <div className="col-xs-12">
                        {this.renderWhitePlayer(activeThread)}
                    </div>

                    <div className="col-xs-12">
                        {this.renderBlackPlayer(activeThread)}
                    </div>

                    <div className="col-xs-12">
                        {this.renderGoldPlayer(activeThread)}
                    </div>

                    <div className="col-xs-12">
                        {this.renderRedPlayer(activeThread)}
                    </div>
                </div>
            );
        } else if(activeThread.gameType === "two-player") {
            return (
                <div>
                    <div className="col-xs-12">
                        {this.renderWhitePlayer(activeThread)}
                    </div>

                    <div className="col-xs-12">
                        {this.renderBlackPlayer(activeThread)}
                    </div>
                </div>
            );
        } else if(activeThread.gameType === "four-player-teams") {

        } else {

        }
    }
}

function mapStateToProps(state) {
    return {
        profile: state.auth.profile,
        activeThread: state.activeThread,
        openThreads: state.openThreads,
    }
}

export default connect(mapStateToProps) (PlayerTimes)
