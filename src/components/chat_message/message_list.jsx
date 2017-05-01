import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MessageListItem from './message_list_item';
import {mapObject} from '../../utils'
import {ListGroup} from 'react-bootstrap';

export default class MessageList extends Component {

    constructor(props) {
        super(props);
    }

    scrollToBottom() {
        const msgList = this.refs.msgList;
        msgList.scrollTop = msgList.scrollHeight;
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.messages.length !== this.props.messages.length) {
            this.scrollToBottom();
        }
    }
    
    componentDidMount() {
        this.scrollToBottom();
    }

    renderChatListItem(index, message) {
        return (
            <MessageListItem
                key={index}
                text={message.msg}
                user={message.user}
                picture={message.picture}
                uid={message.playerId}
                event_type={message.event_type}
                time={message.time}
            />
        );
    }

    render() {
        const { messages } = this.props;

        return (
            <div ref="msgList" className="chatbox-message-list">
                <ListGroup>
                    {mapObject(messages, this.renderChatListItem)}
                </ListGroup>
            </div>
        );
    }
}
