import React, {Component} from 'react';
import { connect } from 'react-redux';
import CreateChatRoom from '../containers/create_chat_room';
import { mapObject } from '../utils/'

class ExistingChatRoomList extends Component {
    constructor (props) {
        super(props)
    }
    renderChatRoomItems(chatRoom) {
        return mapObject( chatRoom, (key, value) => {
            return (
                <li key={key} className="list-group-item">
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

export default connect(mapStateToProps) (ExistingChatRoomList)
