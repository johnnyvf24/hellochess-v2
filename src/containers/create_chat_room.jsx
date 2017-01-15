import React, {Component} from 'react';
import {connect} from 'react-redux';

import {newRoom} from '../actions/'

class CreateChatRoom extends Component {

    constructor(props) {
        super(props)

        this.state = {
            nameChat: '',
            showModal: false
        }

        this.onInputChange = this.onInputChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onInputChange(event) {
        this.setState({
            nameChat: event.target.value
        });
    }

    onSubmit(event) {
        event.preventDefault();
        const chatName = this.state.nameChat;
        if(chatName.length > 0) {

            this.setState({
                nameChat: ''
            });

            this.props.newRoom(chatName);

            this.refs.modalClose.click();
        }
    }

    render() {
        return (
            <div>
                <button
                    className="btn btn-primary btn-sm"
                    data-toggle="modal"
                    data-target="#addChatRoomModal">
                    Add Chat
                </button>

                <div
                    className="modal fade"
                    id="addChatRoomModal"
                    tabIndex="-1"
                    role="dialog"
                    aria-labelledby="myModalLabel"
                    aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <form onSubmit={this.onSubmit}>
                                <div className="modal-header">
                                    <button
                                        type="button"
                                        className="close"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                        ref="modalClose">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                    <h4
                                        className="modal-title"
                                        id="myModalLabel">
                                        Create Chat
                                    </h4>
                                </div>
                                <div className="modal-body">
                                    <input
                                        onChange={this.onInputChange}
                                        value={this.state.nameChat}
                                        className="form-control"
                                        placeholder="Enter chat name here..."
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        data-dismiss="modal">
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-warning">
                                        Save changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default connect(null, {newRoom}) (CreateChatRoom);
