import React, {Component} from 'react';
import {connect} from 'react-redux';
import TwoBoard from './two_board';
import FourBoard from './four_board';

import Chess from 'chess.js';
import Crazyhouse from 'crazyhouse.js';
import SChess from 'schess.js';
import FullhouseChess from '../../../common/fullhouse-chess.js';

export const DARK_SQUARE_HIGHLIGHT_COLOR = '#d2dd9b';
export const LIGHT_SQUARE_HIGHLIGHT_COLOR = '#f2ffb2';
export const DARK_SQUARE_PREMOVE_COLOR = '#aa0000';
export const LIGHT_SQUARE_PREMOVE_COLOR = '#ff0000';

class BoardWrapper extends Component {
    
    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.room != nextProps.room ||
            Object.keys(this.props.openThreads).length != Object.keys(nextProps.openThreads).length
           
        );
            
    }

    render() {
        const {room} = this.props;
        
        if(!room || !room.game.gameType) {
            return <div></div>
        }
        
        let gameType = room.game.gameType;
        let roomName = room.room.name;

        var newGameObject, setBoardPosition;
        switch(gameType) {
            case 'standard':
                newGameObject = function() {
                    return new Chess();
                };
                setBoardPosition = function(fen) {
                    this.board.position(fen, false);
                };
                return (
                    <div id="board-wrapper">
                        <TwoBoard
                            setBoardPosition={setBoardPosition}
                            newGameObject={newGameObject}
                            key={roomName}/>
                    </div>
                );
            case 'schess':
                newGameObject = function() {
                    return new SChess();
                };
                setBoardPosition = function(fen) {
                    this.board.position(fen, false);
                };
                return (
                    <div id="board-wrapper">
                        <TwoBoard
                            setBoardPosition={setBoardPosition}
                            newGameObject={newGameObject}
                            key={roomName}/>
                    </div>
                );
            case 'four-player':
                return (
                    <div id="board-wrapper">
                        <FourBoard key={roomName} />
                    </div>
                );
            case 'four-player-teams':
                return (
                    <div id="board-wrapper">

                    </div>
                );
            case 'crazyhouse':
            case 'crazyhouse960':
                newGameObject = function() {
                    if (gameType === "crazyhouse")
                        return new Crazyhouse();
                    else
                        return new Crazyhouse({960: true});
                };
                setBoardPosition = function(fen) {
                    if (fen) {
                        fen = fen.split(' ')[0];
                        // separate position and hand
                        let fenParts = fen.split('/');
                        let position = fenParts.slice(0,8).join('/');
                        let hand = fenParts[8];
                        // convert hand to format board expects
                        // 'Pp' -> {wP:1,bP:1}
                        let handConverted = {
                            wP: 0, wN: 0, wB: 0, wR: 0, wQ: 0,
                            bP: 0, bN: 0, bB: 0, bR: 0, bQ: 0
                        };
                        if (hand.length > 0) {
                            let pieceLetters = 'pnbrq';
                            for (let i = 0, len = pieceLetters.length; i < len; i++) {
                                let blackPiece = pieceLetters.charAt(i);
                                let whitePiece = blackPiece.toUpperCase();
                                let numWhite = hand.split(whitePiece).length - 1;
                                let numBlack = hand.split(blackPiece).length - 1;
                                let whiteKey = 'w' + whitePiece;
                                let blackKey = 'b' + whitePiece; // use whitePiece for uppercase
                                handConverted[whiteKey] = numWhite;
                                handConverted[blackKey] = numBlack;
                            }
                        }
                        // remove fake piece indicators
                        position = position.replace(/~/g, '');
                        this.board.position(position, false);
                        this.board.setHand(handConverted);
                    }
                };
                return (
                    <div id="board-wrapper">
                        <TwoBoard
                            newGameObject={newGameObject}
                            setBoardPosition={setBoardPosition}
                            crazyhouse={true}
                            key={roomName}/>
                    </div>
                );
            case 'fullhouse-chess':
                newGameObject = function() {
                    return new FullhouseChess();
                };
                setBoardPosition = function(fen) {
                    this.board.position(fen, false);
                };
                return (
                    <div id="board-wrapper">
                        <TwoBoard
                            setBoardPosition={setBoardPosition}
                            newGameObject={newGameObject}
                            key={roomName}/>
                    </div>
                );
        }

    }

}

function mapStateToProps(state) {
    if(state.openThreads[state.activeThread]) {
        let gameType = null;
        let room = state.openThreads[state.activeThread];
        if(state.openThreads[state.activeThread].gameType) {
            gameType = state.openThreads[state.activeThread].game.gameType
        }
        return {
            gameType: gameType,
            room: room,
            name: state.activeThread,
        }
    }

    return {};
}

export default connect(mapStateToProps) (BoardWrapper)
