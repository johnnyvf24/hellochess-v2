import React, {Component} from 'react';
import RoomUserList from './room_user_list';
import MessageList from '../chat_message/message_list';
import RoomSettings from './room_settings';
import MessageSend from '../../containers/message_send';

import {Row, Col} from 'react-bootstrap';


export default class Room extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {index, value, active} = this.props;
        return (
            <div
                id={"room-chat-" + value.id}
                key={index} role="tabpanel"
                className= {index === active ? "tab-pane active" : "tab-pane"}>
                <Row className="chatbox-top-stats-wrapper">
                    <span className="chatbox-top-stats">
                        <RoomSettings value={value}/>
                        <a  className="float-xs-right"
                            href="#"
                            data-toggle="modal"
                            data-target={"#modal-room-" + value.id}>
                            {value.users.length} users
                        </a>
                    </span>

                    <div className="modal fade" id={"modal-room-" + value.id}
                        role="dialog"
                        aria-labelledby="chatUserModal"
                        aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                    <h5 className="modal-title" id="exampleModalLabel">Room Members</h5>
                                </div>
                                <div className="modal-body">
                                    <RoomUserList users={value.users}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </Row>
                <Row className="chatbox-message-list-wrapper">
                    <MessageList messages={value.messages}/>
                </Row>
                <Row className="chatbox-input-send-wrapper">
                    <MessageSend />
                </Row>
            </div>
        )
    }
}
