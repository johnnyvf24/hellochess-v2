import React, {Component} from 'react';
import {connect} from 'react-redux';
import PGNMove from './pgn_move';

class PGNMoveRow extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <div className="pgn-move-row">
                <div className="pgn-move-index">
                    {this.props.index}
                </div>
                {this.props.moveRow.map((move) => {
                    return (
                        <PGNMove
                            move={move}
                            key={move.ply}
                            />
                    );
                })}
            </div>
        );
    }
    
}


class PGNMoveList extends Component {

    constructor(props) {
        super(props);
    };
    
    
    shouldComponentUpdate(nextProps) {
        if(nextProps.activeThread != this.props.activeThread) 
            return true;
        if(nextProps.game.fen != this.props.game.fen) {
            return true;
        }
        if (nextProps.pgn != this.props.pgn) {
            return true;
        }
        if (this.props.activePly != nextProps.activePly) {
            return true;
        }
        return false;
    }
    
    scrollToBottom() {
        console.log("scrolling to bottom");
        this.moveListElem.scrollTop = 99999;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.activePly != nextProps.activePly) {
            // scroll the move list to the active move
            //let activeMoveElem = $(".pgn-move.active", this.moveListElem)[0];
            //this.scrollToBottom()
        }
    }
    
    componentDidUpdate(prevProps) {
        // only scroll to bottom if we're on the latest move
        if (this.props.activePly === this.props.pgn.length) {
            this.scrollToBottom();
        }
    }

    componentWillMount() {
    }
    
    movesToRows(moves) {
        let i, row, numPlayers = 2;
        let rows = [];
        for (i = 0; i < moves.length; i += numPlayers) {
            row = moves.slice(i, i+numPlayers);
            rows.push(row);
        }
        return rows;
    }
    
    addPly(moves) {
        // add the ply for each move
        let movesWithPlys = [];
        for (let i = 0; i < moves.length; i++) {
            let moveObj = {
                san: moves[i].san,
                ply: i + 1
            };
            if (this.props.activePly === i+1) {
                moveObj.active = true;
            }
            movesWithPlys.push(moveObj);
        }
        return movesWithPlys;
    }

    render() {
        let moves = this.addPly(this.props.pgn);
        let moveRows = this.movesToRows(moves);
        return (
            <div className="pgn-move-list"
                ref={(moveList) => {this.moveListElem = moveList}}>
                {moveRows.map((moveRow, index) => {
                    return (
                        <PGNMoveRow
                            moveRow={moveRow}
                            index={index+1}
                            key={index+1}/>
                    );
                })}
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    let activeThread = state.activeThread;
    let room = state.openThreads[activeThread];
    let selectedMove = room.selectedMove;
    let game = room.game;
    let pgn = game.pgn;
    let activePly = room.activePly;
    return {
        activeThread: activeThread,
        room: room,
        selectedMove: selectedMove,
        game: game,
        pgn: pgn,
        activePly: activePly
    }
}

export default connect(mapStateToProps)(PGNMoveList);
