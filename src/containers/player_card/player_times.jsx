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
    
    // returns the order of the player cards when the game hasn't started
    determineSitOrder(room, profile) {
        let renderOrder = [];
        switch(room.gameType) {
            case "four-player":
                renderOrder = [this.renderGold, this.renderBlack, this.renderRed, this.renderWhite];
                break;
            case "two-player":
            default:
                renderOrder = [this.renderBlack, this.renderWhite];
        }
        return renderOrder;
    }
    
    // returns the order of the player cards when the game has started
    determinePlayingOrder(room, profile) {
        let renderOrder = [];
        switch (room.gameType) {
            case "four-player":
                switch(profile._id) {
                    case room.black && room.black._id:
                        renderOrder = [this.renderRed, this.renderWhite, this.renderGold, this.renderBlack];
                        break;
                    case room.gold && room.gold._id:
                        renderOrder = [this.renderBlack, this.renderRed, this.renderWhite, this.renderGold];
                        break;
                    case room.red && room.red._id:
                        renderOrder = [this.renderWhite, this.renderGold, this.renderBlack, this.renderRed];
                        break;
                    case room.white && room.white._id:
                    default:
                        renderOrder = [this.renderGold, this.renderBlack, this.renderRed, this.renderWhite];
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
    
    determineCardOrder() {
        let {activeThread, openThreads, profile} = this.props;
        activeThread = openThreads[activeThread];
        if(!openThreads || !activeThread) {
            return null;
        }
        let room = activeThread;
        // determine the vertical ordering of the cards.
        // current player goes on the bottom.
        let renderOrder = [];
        if (activeThread.fen) {
            renderOrder = this.determinePlayingOrder(room, profile);
        } else {
            renderOrder = this.determineSitOrder(room, profile);
        }
        return renderOrder;
    }

    render() {
        let {activeThread, openThreads, profile} = this.props;
        activeThread = openThreads[activeThread];
        if(!openThreads || !activeThread) {
            return <div></div>  //TODO AD here
        }
        let renderers = this.determineCardOrder();
        let renderedCards = renderers.map((renderer) => {
            renderer(activeThread);
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
