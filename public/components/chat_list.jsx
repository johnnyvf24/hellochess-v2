import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ChatListItem from './chat_list_item';
import { connect } from 'react-redux';

class ChatList extends Component {

    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        const objDiv = document.getElementById('message-list');
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    renderChatListItem(message, index) {
        return (
            <ChatListItem
                key={index}
                text={message.msg}
                user={message.user}
                picture={message.picture}
            />
        );
    }

    render() {
        return (
            <ul id="message-list" className="list-group chatbox-message-list">
                {this.props.messages.map(this.renderChatListItem)}
            </ul>
        );
    }
}

function mapStateToProps({socket}) {
    return {messages: socket.messages};
}

export default connect(mapStateToProps)(ChatList);
