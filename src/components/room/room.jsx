import React, {Component} from 'react';
import RoomUserList from './room_user_list';
import MessageList from '../message_list';
import RoomSettings from './room_settings';
import MessageSend from '../../containers/message_send';


export default class Room extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {index, value, active} = this.props;
        return (
            <div
                id={index + "-chat"}
                key={index} role="tabpanel"
                className= {index === active ? "tab-pane active" : "tab-pane"}>
                <div className="row chatbox-top-stats-wrapper">
                    <span className="chatbox-top-stats">
                        <RoomSettings value={value}/>
                        <a  className="float-xs-right"
                            href="#"
                            data-toggle="modal"
                            data-target={"#" + index + "-modal"}>
                            {value.users.length} users
                        </a>
                    </span>

                    <div className="modal fade" id={index + "-modal"}
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
                </div>
                <div className="row chatbox-message-list-wrapper">
                    <MessageList messages={value.messages}/>
                </div>
                <div className="row chatbox-input-send-wrapper">
                    <MessageSend />
                </div>
            </div>
        )
    }
}
