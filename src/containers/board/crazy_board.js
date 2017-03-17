import React, {Component} from 'react';
import {connect} from 'react-redux';

import TwoBoard from './two_board';
import Crazyhouse from 'crazyhouse.js'; //game rules
import CrazyHand from './crazy_hand';

import {newMove} from '../../actions/room';
import {DARK_SQUARE_HIGHLIGHT_COLOR, LIGHT_SQUARE_HIGHLIGHT_COLOR} from './board_wrapper.jsx'
import {DARK_SQUARE_PREMOVE_COLOR, LIGHT_SQUARE_PREMOVE_COLOR} from './board_wrapper.jsx'

class CrazyBoard extends TwoBoard {

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);
    }


    onDragStart(source, piece, position, orientation) {
        super.onDragStart(source, piece, position, orientation);
    }
    
    formatTurn(turn) {
        super.formatTurn(turn);
    }
    
    boardRedraw() {
        super.boardRedraw();
    }

    shadeSquare(square) {
        super.shadeSquare(square);
    }
    
    shadeLastMove() {
        super.shadeLastMove();
    }
    
    shadeSquarePremove(square) {
        super.shadeSquarePremove(square);
    }
    
    renderPremove() {
        super.renderPremove();
    }
    
    setPremove(source, target) {
        super.setPremove(source, target);
    }
    
    executePremove() {
        super.executePremove();
    }
    
    resetPremove() {
        super.resetPremove();
    }

    onDrop(source, target) {
        super.onDrop(source, target);
    }

    onMouseoutSquare() {

    }

    onMouseoverSquare() {

    }

    componentDidMount() {
        super.componentDidMount();
    }

    render() {
        if (this.props.fen
            && this.props.move.from == this.shadeSquareSource
            && this.props.move.to == this.shadeSquareDest) {
                this.shadeLastMove();
        }
        return (
            <div>
                <div id="board"></div>
                <CrazyHand />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.auth.profile,
        fen: state.openThreads[state.activeThread].fen,
        pgn: state.openThreads[state.activeThread].pgn,
        move: state.openThreads[state.activeThread].move,
        room: state.openThreads[state.activeThread],
        name: state.activeThread,
    }
}

export default connect(mapStateToProps, {newMove}) (CrazyBoard)
