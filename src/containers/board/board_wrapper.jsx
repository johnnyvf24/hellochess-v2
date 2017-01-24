import React, {Component} from 'react';
import {connect} from 'react-redux';
import TwoBoard from './two_board';
import FourBoard from './four_board';

class BoardWrapper extends Component {

    render() {
        const {activeThread, openThreads} = this.props;
        if(!activeThread || !openThreads[activeThread]) {
            return <div>Loading...</div>
        }

        const {gameType} = openThreads[activeThread];

        if(!gameType) {
            return <div>Ad</div>
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
