import React, {Component} from 'react';
import {connect} from 'react-redux';
import PlayerCard from '../components/player_card/player_card';

class PlayerTimes extends Component {
    constructor(props) {
        super(props);
    }

    renderWhitePlayer(thread) {
        return <PlayerCard time={thread.time} color="w"/>
    }

    renderBlackPlayer(thread) {
        return <PlayerCard time={thread.time} color="b"/>
    }

    renderGoldPlayer(thread) {
        return <PlayerCard time={thread.time} color="g"/>
    }

    renderRedPlayer(thread) {
        return <PlayerCard time={thread.time} color="r"/>
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
