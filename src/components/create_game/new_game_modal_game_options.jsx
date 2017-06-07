import React, {Component} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import {Button, Row, Col} from 'react-bootstrap';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import {
    enableVoiceChat,
    changeMaxPlayers,
    togglePrivate,
 } from '../../actions/create_game';
import {showError} from '../../actions';
import ToggleButton from 'react-toggle-button';

import {
    selectedGameType,
    selectedNewTime,
    selectedNewTimeIncrement,
} from '../../actions/create_game.js';


const gameTypeOptions = [
    { value: 'standard', label: 'Standard'},
    { value: 'four-player', label: 'Four Player'},
    { value: 'schess', label: 'S-Chess'},
    { value: 'crazyhouse', label: 'Crazyhouse'},
    { value: 'crazyhouse960', label: 'Crazyhouse 960'},
    // { value: 'four-player-team', label: 'Four Player Teams'}
];

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}

class NewGameModalGameOptions extends Component {
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
    
    onChangeMaxInput(event) {
        if(event.target.value && !isNormalInteger(event.target.value)) {
            return this.props.showError('Invalid value in input!')
        }

        this.props.changeMaxPlayers(event.target.value);
    }
    
    renderVoiceChatBtn(voiceChat) {
        if(!voiceChat) {
            return (
                <div className="row">
                    <div className="text-center voice-chat-enable-disable">
                        <span onClick={(event) => this.props.enableVoiceChat()}
                            className="fa-stack fa-2x"
                            title="Allow voice chat in this room">
                            <i className="fa fa-circle fa-stack-2x"></i>
                            <i className="fa fa-microphone fa-inverse fa-stack-1x"></i>
                            <i className="fa fa-ban fa-stack-2x text-danger"></i>
                        </span>
                    </div>
                </div>
            );
        }
        return (
            <div className="row">
                <div className="text-center voice-chat-enable-disable">
                    <span onClick={(event) => this.props.enableVoiceChat()}
                        className="fa-stack fa-2x"
                        title="Disable voice chat in this room">
                        <i className="fa fa-circle fa-stack-2x"></i>
                        <i className="fa fa-microphone fa-inverse fa-stack-1x"></i>
                    </span>
                </div>
            </div>
        );
    }
    
    
    roomName() {
        return `${this.props.profile.username}'s room`;
    }
    
    renderGameInputs() {
        return (
            <div>
                <Col xs={12} sm={6}>
                    <label>
                        Select a game type
                    </label>
                    <Select
                        name="game-type"
                        value={this.props.newGame.gameType}
                        options={gameTypeOptions}
                        clearable={false}
                        searchable={false}
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
            </div>
        );
    }
    
    renderRoomInputs() {
        return (
            <div>
                <Col xs={12} sm={6}>
                    <div className="form-group">
                        <label>Room Name</label>
                        <input
                            ref={this.props.roomNameRef}
                            className="form-control"
                            defaultValue={this.roomName()}
                        />
                    </div>
                </Col>
                <Col xs={12} sm={6}>
                    <div className="form-group">
                        <div hidden className="row">
                            <div className="col-xs-6">
                                <label>
                                    Maximum # Players
                                </label>
                                <input type="text"
                                    className="form-control"
                                    value={this.props.room.maxPlayers}
                                    placeholder="max-players"
                                    onChange={this.onChangeMaxInput.bind(this)}/>
                            </div>
                            <div className="col-xs-6">
                                <label
                                    className="private-game-option-label">
                                    Private game{'?'}
                                </label>
                                <div className="private-game-option">
                                    <ToggleButton
                                        inactiveLabel={'NO'}
                                        activeLabel={'YES'}
                                        value={this.props.room.private}
                                        onToggle={(value) => {
                                                this.props.togglePrivate();
                                            }
                                        }
                                    />
                                </div>
    
                            </div>
                        </div>
                        {this.renderVoiceChatBtn(this.props.room.voiceChat)}
                    </div>
                </Col>
            </div>
        );
    }

    render() {
        return (
            <div>
                <Row>
                    {this.renderGameInputs()}
                </Row>
                <Row>
                    {this.renderRoomInputs()}
                </Row>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        newGame: state.newGameOptions,
        profile: state.auth.profile,
        room: state.newGameOptions.room,
        game: state.newGameOptions,
    }
}

export default connect(mapStateToProps,
    {selectedGameType,
    selectedNewTime,
    selectedNewTimeIncrement,
    enableVoiceChat,
    showError,
    changeMaxPlayers,
    togglePrivate
}) (NewGameModalGameOptions);
