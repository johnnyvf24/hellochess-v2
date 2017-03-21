import React, {Component} from 'react';
import { connect } from 'react-redux';
import ExistingRoomList from './existing_room_list';
import Room from '../components/room/room';
import {mapObject} from '../utils/';
import { selectedRoom, joinRoom, leaveRoom, updateLiveUser } from '../actions';

import {Tabs, Tab, TabContainer, TabContent, TabPane} from 'react-bootstrap';

class RoomViewer extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {

        if(this.props.connection.status) {
            if(!this.props.activeProfile._id) {
                this.props.updateLiveUser(this.props.profile);
                this.props.joinRoom('Global');                  //join the default chatroom
            }
        }
    }

    onSelectTab(chatName, event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.selectedRoom(chatName);
    }

    onCloseChatTab(chatName, event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.leaveRoom(chatName);
        this.props.selectedRoom("Games");
        $(this.mainTab).tab('show');
    }

    renderNavTab(chats, active) {
        return mapObject(chats, (key, value) => {
            let title = <span>
                            <button onClick={(e) =>this.onCloseChatTab(key, e)}
                                className="close closeTab" 
                                type="button" >×</button>{key}
                            </span>;
            return (
                <Tab key={key} eventKey={key} title={title}>
                    <div id="chat-tab-content">
                        <Room key={key} index={key} value={value} active={active}/>
                    </div>
                </Tab>
            );
        });
    }

    render() {
        if(!this.props.profile || !this.props.profile.username) {
            return <div>
            </div>
        }

        let {activeThread, openThreads} = this.props;

        if(!activeThread || !openThreads) {
            return <div>Loading...</div>;
        }

        return (
            <Tabs defaultActiveKey={200} onSelect={this.onSelectTab.bind(this)} id="left-chatbox">
                <Tab eventKey={200} title="Games">
                    <ExistingRoomList />
                </Tab>
                {this.renderNavTab(openThreads, activeThread)}
            </Tabs>
        );
    }
}

function mapStateToProps(state) {
    return {
        connection: state.connection,
        activeThread: state.activeThread,
        openThreads: state.openThreads,
        profile: state.auth.profile,
        activeProfile: state.currentProfile,
    };
}

export default connect(mapStateToProps, {selectedRoom, joinRoom, leaveRoom, updateLiveUser}) (RoomViewer);
