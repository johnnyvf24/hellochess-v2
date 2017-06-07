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
    
    setupTypeahead() {
        console.log("setupTypeahead");
        console.log("input:", $(".challenge-player-input"));
        $(".challenge-player-input").typeahead({
            order: "asc",
            // input: ".challenge-player-input",
            minLength: 2,
            hint: true,
            highlight: true,
            limit: 10,
            callback: {
                onInit: () => { console.log("typeahead init"); },
                onReady: () => { console.log("typeahead ready"); },
                onSearch: (node, query) => { console.log("search happening:", query); },
                onResult: (node, q, r, rc) => {console.log(`query: ${q}, result: ${JSON.stringify(r)}`)}
            },
            source: function() {
                return this.userSearch()
            },
            callback: {
                done: function (data, textStatus, jqXHR) {
                    console.log("done. data:", data);
                },
                fail: function (jqXHR, textStatus, error) {
                    console.log("fail. status:", textStatus);
                }
            }
            // source: function(query, sync, async) {
            //     console.log("query:", query);
            //     $.ajax({
            //         url: '/api/users/search?q=' + query,
            //         cache: true,
            //         success: function(res) {
            //             async(res);
            //         }
            //     });
            // },
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
        return (
            <div className="form-group" style={{"display": display}}>
                <label>Challenge Player</label>
                <input
                    ref={this.props.challengedPlayerRef}
                    type="text"
                    className="form-control challenge-player-input" />
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
