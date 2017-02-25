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
    
    determineRenderOrder() {
        let {activeThread, openThreads, profile} = this.props;
        activeThread = openThreads[activeThread];
        if(!openThreads || !activeThread) {
            return null;
        }
        let room = activeThread;
        // determine the vertical ordering of the cards.
        // current player goes on the bottom.
        let renderOrder = [];
        switch (activeThread.gameType) {
            case "four-player":
                switch(profile._id) {
                    case room.black && room.black._id:
                        renderOrder = [this.renderGold, this.renderWhite, this.renderRed, this.renderBlack];
                        break;
                    case room.gold && room.gold._id:
                        renderOrder = [this.renderWhite, this.renderRed, this.renderBlack, this.renderGold];
                        break;
                    case room.red && room.red._id:
                        renderOrder = [this.renderBlack, this.renderGold, this.renderWhite, this.renderRed];
                        break;
                    case room.white && room.white._id:
                    default:
                        renderOrder = [this.renderRed, this.renderBlack, this.renderGold, this.renderWhite];
                        break;
                }
                break;
            case "two-player":
            default:
                switch(profile._id) {
                    case room.black && room.black._id:
                        renderOrder = [this.renderWhite, this.renderBlack];
                        break;
                    case room.white && room.white._id:
                    default:
                        renderOrder = [this.renderBlack, this.renderWhite];
                        break;
                }
                break;
        }
        return renderOrder;
    }

    render() {
        let {activeThread, openThreads, profile} = this.props;
        activeThread = openThreads[activeThread];
        if(!openThreads || !activeThread) {
            return <div></div>  //TODO AD here
        }
        let renderers = this.determineRenderOrder();
        let renderedCards = [];
        renderers.forEach((renderer) => {
            renderedCards.push(renderer(activeThread));
        });
        return (
            <div>
            {renderedCards}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.auth.profile,
        activeThread: state.activeThread,
        openThreads: state.openThreads
    }
}

export default connect(mapStateToProps) (PlayerTimes)
