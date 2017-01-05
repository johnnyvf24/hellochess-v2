import React, {Component} from 'react';
import { connect } from 'react-redux';
import MessageSend from '../containers/message_send';
import ChatList from '../containers/chat_list';

class ChatViewer extends Component {
    render() {
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

function mapStateToProps(state) {
    // console.log(state);
    return {

    };
}

export default connect(mapStateToProps) (ChatViewer);
