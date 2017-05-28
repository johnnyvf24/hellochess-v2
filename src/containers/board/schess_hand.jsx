import React, {Component} from 'react';
import {connect} from 'react-redux';

import SChess from 'schess.js';

class Piece extends Component {
    constructor() {
        super();
    }
    
    render() {
        let id = "schess-" + this.props.type + '-' + this.props.location;
        let gone = this.props.enabled ? "" : " gone";
        if (this.props.interactive) {
            return (
                <div className="schess-piece-wrapper">
                    <input
                        type="checkbox"
                        className={"schess-piece" + gone}
                        disabled={!this.props.enabled}
                        name={id}
                        id={id} />
                    <label
                        className="schess-piece-label"
                        htmlFor={id}>
                        {this.props.type}
                    </label>
                </div>
            );
        } else {
            return (
                <div className="schess-piece-wrapper">
                    <input
                        type="checkbox"
                        className={"schess-piece" + gone}
                        disabled={true}
                        name={id}
                        id={id} />
                    <label
                        className="schess-piece-label"
                        htmlFor={id}>
                        {this.props.type}
                    </label>
                </div>
            );
        }
    }
}

class RookToggle extends Component {
    constructor() {
        super();
        this.rook_img_src = "./img/chesspieces/wikipedia/wR.png";
    }
    
    render() {
        if (this.props.location === "bottom" && this.props.interactive) {
            return (
                <div className="schess-rook-toggle pull-right">
                    <input
                        type="checkbox"
                        className="schess-rook-toggle"
                        disabled={!this.props.enabled}
                        id="schess-rook-toggle" />
                    <label
                        className="schess-rook-toggle-label"
                        htmlFor="schess-rook-toggle"
                        title="Place the elephant/hawk on the rook's square when castling.">
                        <img
                            src={this.rook_img_src} />
                    </label>
                </div>
            );
        } else {
            return null;
        }
    }
}

class SChessHand extends Component {
    constructor() {
        super();
    }
    
    componentDidMount() {
        $(".schess-piece-wrapper input[type=checkbox]").click(function() {
            let checkedState = $(this).prop("checked");
            $(".schess-piece-wrapper input[type=checkbox]")
                .prop("checked", false);
            $(this).prop("checked", checkedState);
        })
    }
    
    render() {
        let interactive = false;
        let top_hand = null, bottom_hand = null;
        let hand = new SChess(this.props.fen).get_hand();
        if (hand) {
            top_hand = hand.b;
            bottom_hand = hand.w;
            if (this.props.profile._id === this.props.game.black.playerId) {
                top_hand = hand.w;
                bottom_hand = hand.b;
            }
        }
        if (this.props.location === "top") {
            hand = top_hand;
        } else {
            if (this.props.profile._id === this.props.game.white.playerId ||
                this.props.profile._id === this.props.game.black.playerId) {
                if (this.props.game.gameStarted) {
                    interactive = true;
                }
            }
            hand = bottom_hand;
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
                        location={this.props.location}
                        interactive={interactive}
                        enabled={elephantEnabled} />
                    <Piece
                        type="hawk"
                        location={this.props.location}
                        interactive={interactive}
                        enabled={hawkEnabled} />
                </div>
                <RookToggle
                    location={this.props.location}
                    interactive={interactive}
                    enabled={elephantEnabled || hawkEnabled}/>
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
    return {
        profile,
        game,
        fen
    }
}

export default connect(mapStateToProps) (SChessHand)