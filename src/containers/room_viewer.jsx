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
                this.props.joinRoom('Global'); //join the default chatroom
            }
        }
    }
    
    componentDidMount() {
        this.removeHrefs();
    }
    
    componentDidUpdate(prevProps) {
        this.removeHrefs();
        
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
        if (this.props.activeThread === chatName) {
            let openThreadNames =
                Object.keys(this.props.openThreads).filter(name => name !== chatName);
            let numThreads = openThreadNames.length;
            if (numThreads > 0) {
                try {
                    this.props.selectedRoom(openThreadNames[numThreads-1]);
                } catch (e) {
                    this.props.selectedRoom(200);
                }
            } else {
                this.props.selectedRoom(200);
            }
        }
    }
    
    // remove hrefs from tab links so it doesn't show
    // the useless '#' link on hover
    removeHrefs() {
        let tabsContainer = $("ul[role='tablist']")
        let tabs = tabsContainer.find('li a');
        tabs.removeAttr('href');
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
            <Tabs
                defaultActiveKey={this.props.activeThread}
                activeKey={this.props.activeThread}
                onSelect={this.onSelectTab.bind(this)}
                animation={false}
                id="left-chatbox">
                <Tab
                    eventKey={200}
                    title="Games"
                    ref={(tab) => {this.gamesTab = tab;}}>
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
