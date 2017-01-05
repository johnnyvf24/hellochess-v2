import React, {Component} from 'react';
import CreateChatRoom from '../containers/create_chat_room';

export default class ChatRoomList extends Component {
    constructor (props) {
        super(props)
    }

    render() {
        return (
            <div
                className="tab-pane"
                id="chat-room-list"
                role="tabpanel"
                style={{padding: "0px"}}>
                <ul className="list-group">
                    <li className="list-group-item">

                    </li>
                </ul>

                <CreateChatRoom />
            </div>
        );
    }
}
