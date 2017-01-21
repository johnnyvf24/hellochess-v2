import React, {Component} from 'react';
import { connect } from 'react-redux';
import ExistingChatRoomList from './existing_chat_room_list';
import ChatTab from '../components/chat_tab/chat_tab';
import {mapObject} from '../utils/';
import { selectedChat, joinRoom, leaveRoom } from '../actions';


class ChatViewer extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.joinRoom('Global');                  //join the default chatroom
    }

    onTabClick(chatName) {
        this.props.selectedChat(chatName);
    }

    onCloseChatTab(chatName, event) {

        this.props.leaveRoom(chatName);
        this.refs.mainTab.click();
        event.stopPropagation();
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
                        <button
                            className="close"
                            type="button"
                            onClick={this.onCloseChatTab.bind(this, key)}>×</button>
                        {value.name}
                    </a>
                </li>
            );
        });
    }


    renderTabContent(chats, active){
        return mapObject(chats, (key, value) => {
            return (
                <ChatTab key={key} index={key} value={value} active={active}/>
            );
        });

    }

    render() {
        if(!this.props.profile.username) {
            return <div>
            </div>
        }

        let {activeThread, openThreads} = this.props;

        if(!activeThread || !openThreads) {
            return <div>Loading...</div>;
        }

        return (
            <div id="left-chatbox">

                <ul className="nav nav-tabs nav-justified">
                    <li className="nav-item">
                        <a className="nav-link"
                            data-toggle="tab"
                            href="#chat-list"
                            role="tab"
                            ref="mainTab"
                            onClick={(event) => this.onTabClick("Games")}>
                            Games
                        </a>
                    </li>
                    {this.renderNavTab(openThreads, activeThread)}
                </ul>
                <div id="chat-tab-content" className="tab-content">
                    <ExistingChatRoomList />
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

export default connect(mapStateToProps, {selectedChat, joinRoom, leaveRoom}) (ChatViewer);
