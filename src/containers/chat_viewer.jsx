import React, {Component} from 'react';
import { connect } from 'react-redux';
import MessageSend from '../containers/message_send';
import MessageList from '../components/message_list';
import {mapObject} from '../utils/';
import { selectedChat, joinChat, userConnect } from '../actions';

class ChatViewer extends Component {

    componentWillMount() {
        this.props.userConnect(this.props.profile);    //Connect the user to the server
        this.props.joinChat('Global');                  //join the default chatroom
    }

    onTabClick(chatName) {
        this.props.selectedChat(chatName);
    }

    renderNavTab(chats, active) {

        return mapObject(chats, (key, value) => {
            return (
                <li key={key} className={key === active ? "nav-item active" : "nav-item"}>
                    <a
                        className={key === active ? "nav-link active" : "nav-link"}
                        data-toggle="tab"
                        href={"#" +key + "-chat"}
                        onClick={(event) => this.onTabClick(key)}>
                        {value.name}
                    </a>
                </li>
            );
        });
    }


    renderTabContent(chats, active){
        return mapObject(chats, (key, value) => {
            return (
                <div
                    id={key + "-chat"}
                    key={key} role="tabpanel"
                    className= {key === active ? "tab-pane active" : "tab-pane"}>
                    <div className="row chatbox-top-stats-wrapper">
                        <span className="float-xs-right chatbox-top-stats">
                            <a href="#"
                                data-toggle="modal"
                                data-target={"#" + key + "-modal"}>
                                {value.users.length} users
                            </a>
                        </span>

                        <div className="modal fade" id={key + "-modal"}
                            role="dialog"
                            aria-labelledby="chatUserModal"
                            aria-hidden="true">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <h5 className="modal-title" id="exampleModalLabel">Chat Users</h5>
                                    </div>
                                    <div className="modal-body">
                                        <ul className="list-group"></ul>
                                        {value.users.map((user) => {
                                            return (
                                                <li
                                                    key={user.user_id}
                                                    className="list-group-item">
                                                    {user.username}
                                                </li>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row chatbox-message-list-wrapper">
                        <MessageList messages={value.messages}/>
                    </div>
                    <div className="row chatbox-input-send-wrapper">
                        <MessageSend />
                    </div>
                </div>
            );
        });

    }

    render() {
        let {activeThread, openThreads} = this.props;

        if(!activeThread || !openThreads) {
            return <div>Loading...</div>;
        }

        return (
            <div id="left-chatbox">

                <ul className="nav nav-tabs nav-justified">
                    {this.renderNavTab(openThreads, activeThread)}
                </ul>
                <div id="chat-tab-content" className="tab-content">
                    {this.renderTabContent(openThreads, activeThread)}
                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        activeThread: state.activeThread,
        openThreads: state.openThreads,
        profile: state.auth.profile
    };
}

export default connect(mapStateToProps, {selectedChat, joinChat, userConnect}) (ChatViewer);
