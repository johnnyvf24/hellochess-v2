import React, {Component} from 'react';
import {connect} from 'react-redux';
import TwoBoard from './two_board';
import FourBoard from './four_board';

export const DARK_SQUARE_HIGHLIGHT_COLOR = '#d2dd9b';
export const LIGHT_SQUARE_HIGHLIGHT_COLOR = '#f2ffb2';

class BoardWrapper extends Component {

    render() {
        const {activeThread, openThreads} = this.props;
        if(!activeThread || !openThreads[activeThread]) {
            return <div></div>
        }

        const {gameType} = openThreads[activeThread];

        if(!gameType) {
            return <div></div>
        }

        switch(gameType) {
            case 'two-player':
                return (
                    <div id="board-wrapper">
                        <TwoBoard />
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
