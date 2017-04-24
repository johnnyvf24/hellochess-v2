import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
    gameRoomNameChange,
    enableVoiceChat,
    changeMaxPlayers,
    togglePrivate,
 } from '../../actions/create_game';
import {showError} from '../../actions'
import ToggleButton from 'react-toggle-button'
import {Modal} from 'react-bootstrap'

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}

class CreateGameRoom extends Component {

    onInputChange(event) {
        this.props.gameRoomNameChange(event.target.value);
    }

    renderForm() {
        return (
            <form className="form-inline">
                <label className="mr-sm-2" for="changeRoomName">Room Name</label>
                <input id="changeRoomName"
                    className="form-control mb-2 mr-sm-2 mb-sm-0"
                    value={this.props.room.name}
                    onChange={this.onInputChange.bind(this)}
                />

                <label className="custom-control custom-checkbox mb-2 mr-sm-2 mb-sm-0">
                    <input type="checkbox" className="custom-control-input" />
                    <span className="custom-control-indicator"></span>
                    <span className="custom-control-description">Remember my preference</span>
                </label>

                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        );
    }

    renderVoiceChatBtn(voiceChat) {

        if(!voiceChat) {
            return (
                <div className="row"
                    onClick={(event) => this.props.enableVoiceChat()}>
                    <div className="text-center voice-chat-enable-disable">
                        <span className="fa-stack fa-2x">
                            <i className="fa fa-circle fa-stack-2x"></i>
                            <i className="fa fa-microphone fa-inverse fa-stack-1x"></i>
                            <i className="fa fa-ban fa-stack-2x text-danger"></i>
                        </span>
                    </div>
                </div>
            );
        }


        return (
            <div className="row"
                onClick={(event) => this.props.enableVoiceChat()}>
                <div className="text-center voice-chat-enable-disable">
                    <span className="fa-stack fa-2x">
                        <i className="fa fa-circle fa-stack-2x"></i>
                        <i className="fa fa-microphone fa-inverse fa-stack-1x"></i>
                    </span>
                </div>
            </div>
        );


    }

    onChangeMaxInput(event) {
        if(event.target.value && !isNormalInteger(event.target.value)) {
            return this.props.showError('Invalid value in input!')
        }

        this.props.changeMaxPlayers(event.target.value);
    }

    render() {
        return (
            <div>
                <div className="form-group">
                    <label>Room Name</label>
                    <input
                        className="form-control"
                        value={this.props.room.name}
                        onChange={this.onInputChange.bind(this)}
                    />
                </div>
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
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        room: state.newGameOptions.room,
        game: state.newGameOptions,
        profile: state.auth.profile
    }
}

export default connect(mapStateToProps, {gameRoomNameChange,
    enableVoiceChat,
    showError,
    changeMaxPlayers,
    togglePrivate,
}) (CreateGameRoom)
