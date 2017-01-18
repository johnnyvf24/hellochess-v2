import React, {Component} from 'react';
import { connect } from 'react-redux';
import CreateChatRoom from '../containers/create_chat_room';
import { mapObject } from '../utils/'
import {joinRoom} from '../actions/';

class ExistingChatRoomList extends Component {
    constructor (props) {
        super(props)

        this.renderChatRoomItems = this.renderChatRoomItems.bind(this);
    }

    onClickRoom(key, event) {
        this.props.joinRoom(key);
    }

    renderChatRoomItems(chatRoom) {
        return mapObject( chatRoom, (key, value) => {
            return (
                <li key={key}
                    className="list-group-item chat-room-item"
                    onClick={this.onClickRoom.bind(this, key)}>
                    {value.name}
                </li>
            );
        });
    }

    render() {
        const { chatRooms } = this.props;
        return (
            <div
                id="chat-list"
                className="tab-pane"
                role="tabpanel">
                <ul className="list-group chatbox-chatroom-list">

                    {chatRooms.map(this.renderChatRoomItems)}

                </ul>

                <CreateChatRoom />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        chatRooms: state.existingChatRooms
    }
}

export default connect(mapStateToProps, {joinRoom}) (ExistingChatRoomList)
