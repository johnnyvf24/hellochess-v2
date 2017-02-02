import React, {Component} from 'react';

export default class TwoBoard extends Component {

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {

        this.board = new ChessBoard('board');
        this.board.start();

        window.addEventListener('resize', (event) => {
            this.board.resize();
        });
    }

    render() {
        return (
            <div id="board"></div>
        );
    }
}
