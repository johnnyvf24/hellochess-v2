import React, {Component} from 'react';
import { connect } from 'react-redux';
import CreateChatRoom from '../containers/create_chat_room';

class ChatRoomList extends Component {
    constructor (props) {
        super(props)
    }

    componentWillMount() {
        this.props.dispatch({
            type: 'server/get-chatrooms'
        })
    }

    renderChatRoomItems(item) {
        return (
            <li key={item.name} className="list-group-item">
                {item.name}
            </li>
        );
    }

    render() {
        return (
            <div
                className="tab-pane"
                id="chat-room-list"
                role="tabpanel"
                style={{padding: "0px"}}>
                <ul className="list-group">

                    {this.props.chatRooms.map(this.renderChatRoomItems)}

                </ul>

                <CreateChatRoom />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        chatRooms: state.chat
    }
}

export default connect(mapStateToProps) (ChatRoomList)
