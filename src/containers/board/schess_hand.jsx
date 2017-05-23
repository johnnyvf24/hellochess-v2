import React, {Component} from 'react';
import {connect} from 'react-redux';

import SChess from 'schess.js';

class Piece extends Component {
    constructor() {
        super();
    }
    
    render() {
        let id = "schess-" + this.props.type + '-' + this.props.color;
        if (this.props.interactive) {
            return (
                <label>
                    <input
                        type="checkbox"
                        className="schess-piece checkbox"
                        disabled={!this.props.enabled}
                        id={id} />
                    {this.props.type}
                </label>
            );
        } else {
            return (
                <label
                    className="schess-piece"
                    >
                    {this.props.type}
                </label>
            );
        }
    }
}

class SChessHand extends Component {
    constructor() {
        super();
    }
    
    render() {
        let interactive = false;
        let hand;
        if (this.props.location === "top") {
            hand = this.props.top_hand;
        } else {
            if (this.props.profile._id === this.props.game.white.playerId ||
                this.props.profile._id === this.props.game.black.playerId) {
                interactive = true;
            }
            hand = this.props.bottom_hand;
        }
        let elephantEnabled = false, hawkEnabled = false;
        if (hand) {
            elephantEnabled = typeof (hand.find(p => p.type === 'e')) !== "undefined";
            hawkEnabled = typeof (hand.find(p => p.type === 'h')) !== "undefined";
        }
        return (
            <div id="schess-hand-wrapper">
                <div id="schess-hand">
                    <Piece
                        type="elephant"
                        color={this.props.color}
                        interactive={interactive}
                        enabled={elephantEnabled} />
                    <Piece
                        type="hawk"
                        color={this.props.color}
                        interactive={interactive}
                        enabled={hawkEnabled} />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    let profile = state.auth.profile;
    let name = state.activeThread;
    let room = state.openThreads[name];
    let game = room.game;
    let fen = game.fen;
    let top_hand = null, bottom_hand = null;
    let color = 'w';
    let hand = new SChess(fen).get_hand();
    if (hand) {
        top_hand = hand.b;
        bottom_hand = hand.w;
        if (profile._id === game.black.playerId) {
            top_hand = hand.w;
            bottom_hand = hand.b;
            color = 'b';
        }
    }
    return {
        profile,
        color,
        game,
        top_hand,
        bottom_hand
    }
}

export default connect(mapStateToProps) (SChessHand)