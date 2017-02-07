import React, {Component} from 'react';
import {connect} from 'react-redux';
import OnWhite from './occupied/on_white';
import OnBlack from './occupied/on_black';
import OnGold from './occupied/on_gold';
import OnRed from './occupied/on_red';
import SitWhite from './empty/sit_white';
import SitBlack from './empty/sit_black';
import SitGold from './empty/sit_gold';
import SitRed from './empty/sit_red';

class PlayerTimes extends Component {

    renderWhite(thread) {
        if(thread.white) {
            return <OnWhite />
        } else {
            return <SitWhite />
        }
    }

    renderBlack(thread) {
        if(thread.black) {
            return <OnBlack />
        } else {
            return <SitBlack />
        }
    }

    renderGold(thread) {
        if(thread.gold) {
            return <OnGold />
        } else {
            return <SitGold />
        }
    }

    renderRed(thread) {
        if(thread.red) {
            return <OnRed />
        } else {
            return <SitRed />
        }
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
                        {this.renderWhite(activeThread)}
                    </div>

                    <div className="col-xs-12">
                        {this.renderGold(activeThread)}
                    </div>

                    <div className="col-xs-12">
                        {this.renderBlack(activeThread)}
                    </div>

                    <div className="col-xs-12">
                        {this.renderRed(activeThread)}
                    </div>
                </div>
            );
        } else if(activeThread.gameType === "two-player") {
            return (
                <div>
                    <div className="col-xs-12">
                        {this.renderWhite(activeThread)}
                    </div>

                    <div className="col-xs-12">
                        {this.renderBlack(activeThread)}
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
