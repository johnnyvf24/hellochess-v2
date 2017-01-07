import React, {Component} from 'react';
import { connect } from 'react-redux';
import MessageSend from '../containers/message_send';
import MessageList from '../containers/message_list';


class ChatViewer extends Component {

    componentWillMount() {
        this.props.dispatch({
            type:'server/join-chat',
            payload: {
                name: 'Global Chat'
            }
        });
    }

    renderActiveNavTab(activeThread) {
        return (
            <li className="nav-item">
                <a className="nav-link active" data-toggle="tab" href={"#" +activeThread.name + "-chat"}>{activeThread.name}</a>
            </li>
        );
    }

    renderNavTab(chat) {
        return (
            <li className="nav-item">
                <a className="nav-link active" data-toggle="tab" href={"#" +chat.name + "-chat"}>{chat.name}</a>
            </li>
        );
    }

    renderActiveChatContent(activeThread) {
        const chat = this.props.activeChat;

        return (
            <div id={activeThread.name + "-chat"} role="tabpanel" className="tab-pane chat-tab-pane">
                <div className="row chatbox-top-stats-wrapper flex-items-xs-right">
                    <span className="float-xs-right chatbox-top-stats">
                        {activeThread.users} users
                    </span>
                </div>
                <div className="row chatbox-message-list-wrapper">
                    <MessageList />
                </div>
                <div className="row chatbox-input-send-wrapper">
                    <MessageSend />
                </div>
            </div>
        );
    }

    renderTabContent(chat){
        return (
            <div id={chat.name + "-chat"} role="tabpanel" className="tab-pane chat-tab-pane">
                <div className="row chatbox-top-stats-wrapper flex-items-xs-right">
                    <span className="float-xs-right chatbox-top-stats">
                        1000 users
                    </span>
                </div>
                <div className="row chatbox-message-list-wrapper">
                    <ChatList />
                </div>
                <div className="row chatbox-input-send-wrapper">
                    <MessageSend />
                </div>
            </div>
        );
    }

    render() {
        const {activeThread} = this.props;

        if(!activeThread) {
            return <div>Loading...</div>;
        }

        return (
            <div id="left-chatbox">

                <ul className="nav nav-tabs">
                    {this.renderActiveNavTab(activeThread)}

                </ul>
                <div id="chat-tab-content" className="tab-content">
                    {this.renderActiveChatContent(activeThread)}
                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log(state);
    return {
        activeThread: state.activeThread,
        threads: state.threads
    };
}

export default connect(mapStateToProps) (ChatViewer);
