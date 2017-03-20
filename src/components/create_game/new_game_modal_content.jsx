import React, {Component} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import ReactBootstrapSlider  from 'react-bootstrap-slider';

import {
    selectedGameType,
    selectedNewTime,
    selectedNewTimeIncrement,
    createGameRoom
} from '../../actions/create_game.js';
import {Modal} from 'react-bootstrap'

const gameTypeOptions = [
    { value: 'two-player', label: 'Two Player'},
    { value: 'four-player', label: 'Four Player'},
    { value: 'crazyhouse', label: 'Crazyhouse'}
    //{ value: 'four-player-team', label: 'Four Player Teams'}
]

class NewGameModalContent extends Component {
    constructor(props) {
        super(props);

        this.renderTimeType = this.renderTimeType.bind(this);
        this.onCreateGame = this.onCreateGame.bind(this);
        this.ononSelectGameType = this.onSelectGameType.bind(this);
    }

    renderTimeType() {
        const timeControl = this.props.newGame.time.value;
        const increment = this.props.newGame.time.increment;
        if(timeControl <= 2) {
            return (
                <span>/ {increment}sec Bullet
                </span>
            )
        }
        else if(timeControl < 10) {
            return (
                <span>/ {increment}sec Blitz
                </span>
            );
        } else if(timeControl <= 15) {
            return <span>/ {increment}sec Rapid</span>
        } else {
            return <span>/ {increment}sec Classical</span>
        }
    }

    onSelectGameType(val) {
        this.props.selectedGameType(val.value);
    }

    onChangeTime(event) {
        this.props.selectedNewTime(event.target.value);
    }

    onChangeTimeInverval(event) {
        this.props.selectedNewTimeIncrement(event.target.value);
    }

    onCreateGame() {
        this.props.createGameRoom();
    }

    render() {
        return (
            <div className="modal-content">
                {/* Modal header */}
                <div className="modal-header">
                    <button type="button"
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h5 id="new-game-label" className="modal-title">
                        New Game
                    </h5>
                </div>

                {/*Modal body */}
                <div className="modal-body">
                    <div className="row">
                    <div className="col-xs-12 col-sm-6">
                        <label>
                            Select a game type
                        </label>
                        <Select
                            name="game-type"
                            value={this.props.newGame.gameType}
                            options={gameTypeOptions}
                            onChange={this.onSelectGameType.bind(this)}
                        />
                    </div>
                    <div className="col-xs-12 col-sm-6">
                        <div>
                            <label>
                                Time Control (mins)
                            </label>
                            <ReactBootstrapSlider
                                value={this.props.newGame.time.value}
                                slideStop={this.onChangeTime.bind(this)}
                                step={1}
                                max={45}
                                min={1} />
                        </div>

                        <div>
                            <label>
                                Increment (secs)
                            </label>
                            <ReactBootstrapSlider
                                value={this.props.newGame.time.increment}
                                slideStop={this.onChangeTimeInverval.bind(this)}
                                step={1}
                                max={15}
                                min={0} />
                        </div>

                    </div>
                    </div>
                </div>

                {/*Modal footer */}
                <div className="modal-footer">
                    <div className="pull-left">
                        {this.props.newGame.time.value} min {this.renderTimeType()}
                    </div>
                    <button type="button"
                        onClick={this.onCreateGame}
                        className="btn btn-warning">
                        Host Game
                    </button>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        newGame: state.newGameOptions
    }
}

export default connect(mapStateToProps, {selectedGameType, selectedNewTime, selectedNewTimeIncrement, createGameRoom}) (NewGameModalContent);
