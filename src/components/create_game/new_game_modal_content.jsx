import React, {Component} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import {Button, Row, Col} from 'react-bootstrap';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import {
    selectedGameType,
    selectedNewTime,
    selectedNewTimeIncrement,
} from '../../actions/create_game.js';


const gameTypeOptions = [
    { value: 'standard', label: 'Standard'},
    { value: 'four-player', label: 'Four Player'},
    { value: 'crazyhouse', label: 'Crazyhouse'}
    //{ value: 'four-player-team', label: 'Four Player Teams'}
]

class NewGameModalContent extends Component {
    constructor(props) {
        super(props);

        this.renderTimeType = this.renderTimeType.bind(this);
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

    onChangeTime(value) {
        this.props.selectedNewTime(value);
    }

    onChangeTimeInverval(value) {
        this.props.selectedNewTimeIncrement(value);
    }

    render() {
        return (
            <div>
                <Row>
                    <Col xs={12} sm={6}>
                        <label>
                            Select a game type
                        </label>
                        <Select
                            name="game-type"
                            value={this.props.newGame.gameType}
                            options={gameTypeOptions}
                            onChange={this.onSelectGameType.bind(this)}
                        />
                    </Col>
                    <Col xs={12} sm={6}>
                        <div>
                            <label>
                                Time Control ({this.props.newGame.time.value} mins)
                            </label>
                            <Slider
                                value={this.props.newGame.time.value}
                                onChange={this.onChangeTime.bind(this)}
                                step={1}
                                max={45}
                                min={1} />
                        </div>

                        <div>
                            <label>
                                Increment ({this.props.newGame.time.increment} secs)
                            </label>
                            <Slider
                                value={this.props.newGame.time.increment}
                                onChange={this.onChangeTimeInverval.bind(this)}
                                step={1}
                                max={15}
                                min={0} />
                        </div>

                    </Col>
                </Row>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        newGame: state.newGameOptions
    }
}

export default connect(mapStateToProps, {selectedGameType, selectedNewTime, selectedNewTimeIncrement}) (NewGameModalContent);
