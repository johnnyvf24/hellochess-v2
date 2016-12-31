import React, { Component } from 'react';
import ChatListItem from './chat_list_item';

export default class ChatList extends Component {
    render() {
        return (
            <ul className="list-group chatbox-message-list">
                <ChatListItem />
            </ul>
        );
    };
}
