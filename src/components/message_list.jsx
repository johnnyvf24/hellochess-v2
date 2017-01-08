import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MessageListItem from '../components/message_list_item';
import {mapObject} from '../utils'

export default class MessageList extends Component {

    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        const msgList = this.refs.msgList;
        msgList.scrollTop = msgList.scrollHeight;
    }

    renderChatListItem(index, message) {
        return (
            <MessageListItem
                key={index}
                text={message.msg}
                user={message.user}
                picture={message.picture}
            />
        );
    }

    render() {
        const { messages } = this.props;
        
        return (
            <ul ref="msgList" className="list-group chatbox-message-list">
                {mapObject(messages, this.renderChatListItem)}
            </ul>
        );
    }
}
