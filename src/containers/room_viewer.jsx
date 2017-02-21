import React, {Component} from 'react';
import { connect } from 'react-redux';
import ExistingRoomList from './existing_room_list';
import Room from '../components/room/room';
import {mapObject} from '../utils/';
import { selectedRoom, joinRoom, leaveRoom, updateLiveUser } from '../actions';


class RoomViewer extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.updateLiveUser(this.props.profile);
        this.props.joinRoom('Global');                  //join the default chatroom
    }

    onTabClick(chatName, event) {
        this.props.selectedRoom(chatName);
        event.stopPropagation();
    }

    onCloseChatTab(chatName, event) {
        this.props.leaveRoom(chatName);
        event.stopPropagation();
        this.refs.mainTab.click();
    }

    renderNavTab(chats, active) {
        return mapObject(chats, (key, value) => {
            return (
                <li key={key} className={key === active ? "nav-item active" : "nav-item"}
                    onClick={(event) => this.onTabClick(key, event)}>
                    <a
                        className={key === active ? "nav-link active" : "nav-link"}
                        data-toggle="tab"
                        href={"#" +key + "-chat"}
                        >
                        <button
                            className="close"
                            type="button"
                            onClick={this.onCloseChatTab.bind(this, key)}>×</button>
                        {key}
                    </a>
                </li>
            );
        });
    }


    renderTabContent(chats, active) {
        return mapObject(chats, (key, value) => {
            return (
                <Room key={key} index={key} value={value} active={active}/>
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
                            onClick={(event) => this.onTabClick("Games", event)}>
                            Games
                        </a>
                    </li>
                    {this.renderNavTab(openThreads, activeThread)}
                </ul>
                <div id="chat-tab-content" className="tab-content">
                    <ExistingRoomList />
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

export default connect(mapStateToProps, {selectedRoom, joinRoom, leaveRoom, updateLiveUser}) (RoomViewer);
