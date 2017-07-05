import React, {Component} from 'react';
import {connect} from 'react-redux';

class PromotionSelector extends Component {
    constructor() {
        super();
    }
    
    pieceTypes() {
        let pieceTypes;
        console.log("promotion. game type:", this.props.gameType);
        switch(this.props.gameType) {
            case 'schess':
                pieceTypes = ['e', 'h', 'q', 'r', 'n', 'b'];
                break;
            case 'fullhouse-chess':
                pieceTypes = ['q', 'r', 'n', 'b', 'v'];
                break;
            default:
                pieceTypes = ['q', 'r', 'n', 'b'];
                break;
        }
        console.log("piece types:", JSON.stringify(pieceTypes));
        return pieceTypes;
    }
    
    renderPieceButton(color, piece) {
        let pieceCode = color + piece.toUpperCase();
        let imgName = pieceCode + ".png";
        return (
            <button
                id={"promotion-" + pieceCode}
                key={pieceCode}
                onClick={this.onPieceButtonClick.bind(this, piece)}
                className={"promotion-button " + color}>
                <img src={"./img/chesspieces/wikipedia/" + imgName} />
            </button>
        );
    }
    
    onPieceButtonClick() {
        let piece = arguments[0];
        this.props.callback(piece);
    }
    
    onPromotionClose() {
        this.props.onPromotionClose();
    }
    
    render() {
        let pieceTypes = this.pieceTypes();
        let color = this.props.color;
        let className = this.props.visible ? "visible" : "hidden";
        return (
            <div
                id="promotion-selector"
                className={className}
                onClick={this.onPromotionClose.bind(this)}>
                <div id="promotion-pieces-wrapper">
                    {pieceTypes.map(p => this.renderPieceButton(color, p))}
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
    let color = 'w';
    if (game.white && game.white.playerId === profile._id) {
        color = 'w';
    } else if (game.black && game.black.playerId === profile._id) {
        color = 'b';
    } else if (game.red && game.red.playerId === profile._id) {
        color = 'r';
    } else if (game.gold && game.gold.playerId === profile._id) {
        color = 'g';
    }
    let visible = room.promotionVisible;
    let callback = room.promotionCallback;
    return {
        color,
        visible,
        callback,
        gameType: game.gameType,
    };
}

export default connect(mapStateToProps) (PromotionSelector)