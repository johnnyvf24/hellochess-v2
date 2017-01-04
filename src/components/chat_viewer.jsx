import React, {Component, PropTypes} from 'react';
import MessageSend from '../containers/message_send';
import ChatList from '../containers/chat_list';

export default class ChatViewer extends Component {
    render() {
        const { dispatch, isAuthenticated, errorMessage } = this.props
        return (
            <div id="chatbox-wrapper" className="col-sm-6">
                <div id="left-chatbox" className="card">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a className="nav-link active" data-toggle="tab" href="#global-chat">Global Chat</a>
                        </li>
                    </ul>
                    <div className="tab-content">
                        <div role="tabpanel" className="tab-pane active" id="global-chat">
                            <div className="row chatbox-top-stats">
                                <span className="float-xs-right">
                                    1000 chat members
                                </span>
                            </div>
                            <ChatList />
                            <MessageSend />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ChatViewer.PropTypes = {
    dispatch: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    errorMessage: PropTypes.string
}
