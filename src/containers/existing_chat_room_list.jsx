import React, {Component} from 'react';
import { connect } from 'react-redux';
import CreateChatRoom from '../containers/create_chat_room';
import { mapObject } from '../utils/'

class ExistingChatRoomList extends Component {
    constructor (props) {
        super(props)
    }

    componentWillMount() {
        this.props.dispatch({
            type: 'server/get-chatrooms'
        })
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
        // console.log(chatRooms);
        return (
            <div
                className="tab-pane"
                id="chat-room-list"
                role="tabpanel"
                style={{padding: "0px"}}>
                <ul className="list-group">

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
