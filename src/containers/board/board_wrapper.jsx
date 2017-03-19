import React, {Component} from 'react';
import {connect} from 'react-redux';
import TwoBoard from './two_board';
import FourBoard from './four_board';

import Chess from 'chess.js';
import Crazyhouse from 'crazyhouse.js';

export const DARK_SQUARE_HIGHLIGHT_COLOR = '#d2dd9b';
export const LIGHT_SQUARE_HIGHLIGHT_COLOR = '#f2ffb2';
export const DARK_SQUARE_PREMOVE_COLOR = '#aa0000';
export const LIGHT_SQUARE_PREMOVE_COLOR = '#ff0000';

class BoardWrapper extends Component {
    
    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.activeThread != nextProps.activeThread ||
            Object.keys(this.props.openThreads).length != Object.keys(nextProps.openThreads).length
        );
            
    }

    render() {
        const {activeThread, openThreads} = this.props;
        if(!activeThread || !openThreads[activeThread]) {
            return <div></div>
        }

        const {gameType} = openThreads[activeThread];

        if(!gameType) {
            return <div></div>
        }
        var newGameObject, setBoardPosition;
        switch(gameType) {
            case 'two-player':
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
                            key={activeThread}/>
                    </div>
                );
            case 'four-player':
                return (
                    <div id="board-wrapper">
                        <FourBoard />
                    </div>
                );
            case 'four-player-teams':
                return (
                    <div id="board-wrapper">

                    </div>
                );
            case 'crazyhouse':
                newGameObject = function() {
                    return new Crazyhouse();
                };
                setBoardPosition = function(fen) {
                    if (fen) {
                        fen = fen.split(' ')[0];
                        // remove hand from end
                        fen = fen.split('/').slice(0, 8).join('/');
                        // remove fake piece indicators
                        fen = fen.replace(/~/g, '');
                        this.board.position(fen, false);
                        this.board.setHand(this.getBoardHand());
                    }
                };
                return (
                    <div id="board-wrapper">
                        <TwoBoard
                            newGameObject={newGameObject}
                            setBoardPosition={setBoardPosition}
                            crazyhouse={true}
                            key={activeThread}/>
                    </div>
                );
        }

    }

}

function mapStateToProps(state) {
    return {
        activeThread: state.activeThread,
        openThreads: state.openThreads,
    }
}

export default connect(mapStateToProps) (BoardWrapper)
