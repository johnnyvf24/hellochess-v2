import React, {Component} from 'react';

export default class TwoBoard extends Component {

    shouldComponentUpdate() {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        // this.board.doSomething();
    }

    componentDidMount() {
        this.board = new ChessBoard('board');
    }

    render() {
        return (
            <div id="board"></div>
        );
    }

}
