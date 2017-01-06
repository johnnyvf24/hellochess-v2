import React, {Component} from 'react';
import { connect } from 'react-redux';
import MessageSend from '../containers/message_send';
import ChatList from '../containers/chat_list';

class ChatViewer extends Component {

    componentDidMount() {
        this.props.dispatch({
            type:'server/join-chatroom',
            payload: {
                name: 'Global Chat'
            }
        });
    }

    renderNavTab(chat) {
        return (
            <li className="nav-item">
                <a className="nav-link active" data-toggle="tab" href="#global-chat">{chat.name}</a>
            </li>
        );
    }

    renderTabContent(){
        return (
            <div role="tabpanel" className="tab-pane active chat-tab-pane">
                <div className="row chatbox-top-stats flex-items-xs-right">
                    <span className="float-xs-right">
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
        console.log(this.props.openChats);
        return (
            <div id="left-chatbox">

                <ul className="nav nav-tabs">
                    {this.props.openChats.map(this.renderNavTab)}
                </ul>
                <div id="chat-tab-content" className="tab-content">
                    {this.props.openChats.map(this.renderTabContent)}
                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        openChats: state.openChats
    };
}

export default connect(mapStateToProps) (ChatViewer);
