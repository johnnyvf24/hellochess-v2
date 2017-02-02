import React, {Component} from 'react';

export default class FourBoard extends Component {

    shouldComponentUpdate() {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        // this.board.doSomething();
    }

    componentDidMount() {
        const options ={
            showNotation: false
        }
        this.board = new FourChessBoard('four-board', options);
        this.board.start();

        window.addEventListener('resize', (event) => {
            this.board.resize();
        });
    }

    render() {
        return (
            <div id="four-board"></div>
        );
    }

}
