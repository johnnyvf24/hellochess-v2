import React, {Component} from 'react';
import {connect} from 'react-redux';
import PGNMove from './pgn_move';

class PGNMoveRow extends Component {
    constructor(props) {
        super(props);
        this.movesPerRow = 2;
    }
    
    renderIndex(index) {
        if (index === -1) {
            return "...";
        }
        return index;
    }
    
    padRow() {
        let moveRow = this.props.moveRow;
        let startIndex = moveRow.length;
        while (moveRow.length < this.movesPerRow) {
            moveRow.push({type: "pad"});
        }
        return moveRow;
    }
    
    render() {
        let moveRow = this.padRow();
        return (
            <div className="pgn-move-row">
                <div className="pgn-move-index">
                    {this.renderIndex(this.props.index)}
                </div>
                {moveRow.map((move, index) => {
                    if (move.type === "pad") {
                        return (
                            <div
                                className="pgn-move pad"
                                key={index}>
                            </div>
                        );
                    } else if (move.type === "out") {
                        return (
                            <div
                                className="pgn-move out"
                                key={index}>
                            </div>
                        );
                    } else {
                        return (
                            <PGNMove move={move} key={index}/>
                        );
                    }
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
    
    componentDidMount() {
        this.scrollToBottom();
    }
    
    movesToRows(moves) {
        let i, row;
        const movesPerRow = 2;
        let numPlayers = this.props.game.numPlayers;
        let rows = [];
        let rowIndex = 1;
        let rowCount = 1;
        for (i = 0; i < moves.length; i += numPlayers, rowIndex++) {
            row = moves.slice(i, i+numPlayers);
            // make each row into size movesPerRow
            let firstRow = row.slice(0, movesPerRow);
            rows.push(<PGNMoveRow moveRow={firstRow} index={rowIndex} key={rowCount++}/>);
            for (let j = movesPerRow; j < row.length; j += movesPerRow) {
                let subRow = row.slice(j, j+movesPerRow);
                rows.push(<PGNMoveRow moveRow={subRow} index={-1} key={rowCount++}/>);
            }
        }
        return rows;
    }
    
    addPly(moves) {
        switch (this.props.gameType) {
            case 'four-player':
                return this.addPly4p(moves);
            default:
                return this.addPly2p(moves);
        }
    }
    
    addPly2p(moves) {
        // add the ply for each move
        let movesWithPlys = [];
        for (let i = 0; i < moves.length; i++) {
            let moveObj = {
                san: moves[i].san,
                ply: i + 1
            };
            movesWithPlys.push(moveObj);
        }
        return movesWithPlys;
    }
    
    addPly4p(moves) {
        let nextColor = {
            'w': 'g',
            'g': 'b',
            'b': 'r',
            'r': 'w'
        };
        let movesWithPlys = [];
        let currentColor = 'w';
        for (let i = 0; i < moves.length; i++) {
            let move = moves[i];
            let moveObj = {
                type: "move",
                san: moves[i].san,
                color: moves[i].color,
                ply: i + 1
            };
            movesWithPlys.push(moveObj);
            let correctNextColor = nextColor[currentColor];
            let nextMove = moves[i+1];
            if (nextMove) {
                while (nextMove.color != correctNextColor) {
                    let moveObj = {
                        type: "out"
                    };
                    movesWithPlys.push(moveObj);
                    correctNextColor = nextColor[correctNextColor];
                }
            }
            currentColor = correctNextColor;
        }
        return movesWithPlys;
    }
    
    moveListClassName() {
        switch (this.props.gameType) {
            case 'four-player':
                return "pgn-move-list four-player";
            default:
                return "pgn-move-list two-player";
        }
    }

    render() {
        let moves = this.addPly(this.props.pgn);
        let moveRows = this.movesToRows(moves);
        return (
            <div className="pgn-move-list"
                ref={(moveList) => {this.moveListElem = moveList}}>
                {moveRows}
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    let activeThread = state.activeThread;
    let room = state.openThreads[activeThread];
    let gameType = room.game.gameType;
    let selectedMove = room.selectedMove;
    let game = room.game;
    let pgn = game.pgn;
    let activePly = room.activePly;
    return {
        activeThread: activeThread,
        room: room,
        gameType: gameType,
        selectedMove: selectedMove,
        game: game,
        pgn: pgn,
        activePly: activePly
    }
}

export default connect(mapStateToProps)(PGNMoveList);
