import React, {Component} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import {Button, Row, Col, Glyphicon, OverlayTrigger, Tooltip} from 'react-bootstrap';
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
    selectedRoomMode,
} from '../../actions/create_game.js';
import {userSearch} from '../../actions/user';

const roomModeOptions = [
    { value: 'open-table', label: 'Open Table' },
    { value: 'match', label: 'Match' },
];

class NewGameModalGameOptions extends Component {
    constructor(props) {
        super(props);
        this.onSelectRoomMode = this.onSelectRoomMode.bind(this);
        this.renderChallengePlayerInput = this.renderChallengePlayerInput.bind(this);
    }
    
    componentDidUpdate(prevProps) {
        if (!this.props.userResults)
            return;
        if (this.deferred) {
            this.deferred.resolve(this.props.userResults);
        }A
    }
    
    setupTypeahead() {
        $(".challenge-player-input").typeahead({
            debug: true,
            template: "{{username}}",
            templateValue: "{{username}}",
            cache: true,
            order: "asc",
            input: ".challenge-player-input",
            minLength: 2,
            hint: true,
            highlight: true,
            limit: 10,
            dynamic: true,
            display: ["username"],
            emptyTemplate: 'No users found: "{{query}}"',
            source: {
                data: () => {
                    let v = $(".challenge-player-input").val();
                    if (!v || v === "" || v.length < 2) {
                        return [];
                    }
                    this.props.userSearch(v);
                    let deferred = $.Deferred();
                    this.deferred = deferred;
                    return deferred;
                }
            }
        });
    }
    
    componentDidMount() {
        this.setupTypeahead();
    }
    
    onSelectRoomMode(val) {
        this.props.selectedRoomMode(val.value);
    }
    
    renderRoomMode() {
        return (
            <div>
                <label>Room Mode</label>
                <Select
                    name="room-mode"
                    value={this.props.room.roomMode}
                    options={roomModeOptions}
                    clearable={false}
                    searchable={false}
                    onChange={this.onSelectRoomMode} />
            </div>
        );
    }
    
    renderChallengePlayerInput() {
        let display;
        if (this.props.room.roomMode === "match") {
            display = "block";
        } else {
            display = "none";
        }
        const tooltip = <Tooltip>Leave blank to allow the first player seated to play.</Tooltip>;
        return (
            <div className="form-group typeahead__container" style={{"display": display}}>
                <label>Challenge Player</label>
                &nbsp;
                <OverlayTrigger placement="top" overlay={tooltip}>
                    <Glyphicon
                        glyph="question-sign"
                        bsStyle="default"
                        rel="tooltip" />
                </OverlayTrigger>
                <div className="typeahead__field">
                    <span className="typeahead__query">
                        <input
                            ref={this.props.challengedPlayerRef}
                            type="text"
                            className="form-control challenge-player-input js-typeahead" />
                    </span>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                <Row>
                    <Col xs={12} sm={6}>
                        {this.renderRoomMode()}
                    </Col>
                    <Col xs={12} sm={6}>
                        {this.renderChallengePlayerInput()}
                    </Col>
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
        userResults: state.userSearch.userResults
    }
}

export default connect(mapStateToProps,
    {selectedGameType,
    selectedNewTime,
    selectedNewTimeIncrement,
    enableVoiceChat,
    showError,
    changeMaxPlayers,
    togglePrivate,
    selectedRoomMode,
    userSearch
}) (NewGameModalGameOptions);
