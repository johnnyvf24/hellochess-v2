import React, {Component} from 'react';
import {connect} from 'react-redux';
import OccupiedCard from './occupied_card';
import EmptyCard from './empty_card';
import PGNViewer from '../pgn/pgn_viewer';

class PlayerTimes extends Component {

    renderWhite(thread) {
        if (thread.game.white) {
            return <OccupiedCard color="w" longColor="white" colorClass=""/>
        } else {
            return <EmptyCard color="w" colorClass=""/>
        }
    }

    renderBlack(thread) {
        if (thread.game.black) {
            return <OccupiedCard color="b" longColor="black" colorClass="black-player"/>
        } else {
            return <EmptyCard color="b" colorClass="black-player"/>
        }
    }

    renderGold(thread) {
        if (thread.game.gold) {
            return <OccupiedCard color="g" longColor="gold" colorClass="gold-player"/>
        } else {
            return <EmptyCard color="g" colorClass="gold-player"/>
        }
    }

    renderRed(thread) {
        if (thread.game.red) {
            return <OccupiedCard color="r" longColor="red" colorClass="red-player"/>
        } else {
            return <EmptyCard color="r" colorClass="red-player"/>
        }
    }

    // returns the order of the player cards when the game hasn't started
    determineSitOrder(room, profile) {
        let renderOrder = [];
        switch (room.game.gameType) {
            case "four-player":
                renderOrder = [this.renderGold, this.renderBlack, this.renderRed, this.renderWhite];
                break;
            case "standard":
            default:
                renderOrder = [this.renderBlack, this.renderWhite];
        }
        return renderOrder;
    }

    // returns the order of the player cards when the game has started
    determinePlayingOrder(room, profile) {
        let renderOrder = [];
        const white = room.game.white;
        const black = room.game.black;
        const red = room.game.red;
        const gold = room.game.gold;
        try {
            switch (room.game.gameType) {
                case "four-player":
                    renderOrder = [this.renderGold, this.renderBlack, this.renderRed, this.renderWhite];
                    if(!black) {
                        break;
                    }
                    switch (profile._id) {
                        case black.playerId:
                            renderOrder = [this.renderRed, this.renderWhite, this.renderGold, this.renderBlack];
                            break;
                        case gold.playerId:
                            renderOrder = [this.renderBlack, this.renderRed, this.renderWhite, this.renderGold];
                            break;
                        case red.playerId:
                            renderOrder = [this.renderWhite, this.renderGold, this.renderBlack, this.renderRed];
                            break;
                        case white.playerId:
                        default:
                            break;
                    }
                    break;
                case "standard":
                    default:
                        renderOrder = [this.renderBlack, this.renderWhite];
                        if(!black) {
                            break;
                        }
                        switch (profile._id) {
                            case black.playerId:
                                renderOrder = [this.renderWhite, this.renderBlack];
                                break;
                            case white.playerId:
                            default:
                                break;
                        }
                        break;
            }
        } catch (err) {
            console.error(err);
        }
        return renderOrder;
    }

    determineCardOrder() {
        let {activeThread, openThreads, profile} = this.props;
        activeThread = openThreads[activeThread];
        if (!openThreads || !activeThread) {
            return null;
        }
        let room = activeThread;
        // determine the vertical ordering of the cards.
        // current player goes on the bottom.
        let renderOrder = [];
        if (activeThread.game.gameStarted === true) {
            renderOrder = this.determinePlayingOrder(room, profile);
        } else {
            renderOrder = this.determineSitOrder(room, profile);
        }
        return renderOrder;
    }

    render() {
        let {activeThread, openThreads, profile} = this.props;
        activeThread = openThreads[activeThread];
        if (!openThreads || !activeThread) {
            return <div></div>
        }
        let cardRenderers = this.determineCardOrder();
        let renderedCards = cardRenderers.map((cardRenderer, index) => {
            return (
                <div className="col-xs-12" key={index}>
                {cardRenderer(activeThread)}
                </div>
            );
        });
        return (
            <div>
                {renderedCards}
                <div className="col-xs-12">
                    <PGNViewer />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {profile: state.auth.profile, activeThread: state.activeThread, openThreads: state.openThreads}
}

export default connect(mapStateToProps)(PlayerTimes)
