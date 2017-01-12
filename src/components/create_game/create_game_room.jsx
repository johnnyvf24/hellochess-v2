import React, {Component} from 'react';
import {connect} from 'react-redux';
import {gameRoomNameChange, enableVoiceChat, resetNewGameModal} from '../../actions/create_game';
import ToggleButton from 'react-toggle-button'

class CreateGameRoom extends Component{

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
                <div className="voice-chat-enable-disable"
                    onClick={(event) => this.props.enableVoiceChat()}>
                    <span className="fa-stack fa-2x">
                        <i className="fa fa-circle fa-stack-2x"></i>
                        <i className="fa fa-microphone fa-inverse fa-stack-1x"></i>
                        <i className="fa fa-ban fa-stack-2x text-danger"></i>
                    </span>
                    <div>Voice Chat {voiceChat ? "ON": "OFF"}</div>
                </div>
            );
        }


        return (
            <div className="voice-chat-enable-disable"
                onClick={(event) => this.props.enableVoiceChat()}>
                <span className="fa-stack fa-2x">
                    <i className="fa fa-circle fa-stack-2x"></i>
                    <i className="fa fa-microphone fa-inverse fa-stack-1x"></i>
                </span>
                <div>Voice Chat {voiceChat ? "ON": "OFF"}</div>
            </div>
        );


    }

    render() {
        return (
            <div className="modal-content">
                {/* Modal header */}
                <div className="modal-header">
                    <button type="button"
                        className="close"
                        data-dismiss="modal"
                        onClick={(event) => this.props.resetNewGameModal()}
                        aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h5 id="new-game-label" className="modal-title">
                        Create Game Room
                    </h5>
                </div>

                {/*Modal body */}
                <div className="modal-body">

                    <div className="form-group">
                        <label>Room Name</label>
                        <input
                            className="form-control"
                            value={this.props.room.name}
                            onChange={this.onInputChange.bind(this)}
                        />
                    </div>
                    <div className="form-group">
                        <div className="row">
                            <div className="col-xs-6">
                                <input type="text"
                                    className="form-control"
                                    placeholder="Min Players" />
                            </div>
                            <div className="col-xs-6">
                                <input type="text"
                                    className="form-control"
                                    placeholder="max-players" />
                            </div>
                        </div>

                        {this.renderVoiceChatBtn(this.props.room.voiceChat)}

                    </div>

                </div>

                {/*Modal footer */}
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        data-dismiss="modal"
                        onClick={(event) => this.props.resetNewGameModal()}>
                        Cancel
                    </button>
                    <button type="button"
                        className="btn btn-warning">
                        Create Game
                    </button>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        room: state.newGameOptions.room
    }
}

export default connect(mapStateToProps, {gameRoomNameChange, enableVoiceChat, resetNewGameModal}) (CreateGameRoom)
