import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MessageListItem from '../components/message_list_item';
import { connect } from 'react-redux';

class MessageList extends Component {

    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        const msgList = this.refs.msgList;
        msgList.scrollTop = msgList.scrollHeight;
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
            <ul ref="msgList" className="list-group chatbox-message-list">
                {this.props.messages.map(this.renderChatListItem)}
            </ul>
        );
    }
}

function mapStateToProps(state) {
    return {messages: state.messages.data};
}

export default connect(mapStateToProps)(MessageList);
