import React, {Component} from 'react';
import { connect } from 'react-redux';
import {Tabs, Tab} from 'react-bootstrap-tabs';
import MessageSend from '../containers/message_send';
import MessageList from '../components/message_list';
import {mapObject} from '../utils/';
import { changeActiveThread } from '../actions';

class ChatViewer extends Component {

    componentWillMount() {
        // this.props.dispatch({
        //     type:'server/join-chat',
        //     payload: {
        //         name: 'Global Chat',
        //         messages: []
        //     }
        // });
        //
        // this.props.dispatch({
        //     type:'server/join-chat',
        //     payload: {
        //         name: 'test Chat',
        //         messages: []
        //     }
        // });
    }

    renderNavTab(chats, active) {

        return mapObject(chats, (key, value) => {
            return (
                <li key={key} className={key === active ? "nav-item active" : "nav-item"}>
                    <a
                        className={key === active ? "nav-link active" : "nav-link"}
                        data-toggle="tab"
                        href={"#" +key + "-chat"}>
                        {value.name}
                    </a>
                </li>
            );
        });
    }

    onClickTab(event) {
        console.log(event);
    }

    renderTabContent(chats, active){
        return mapObject(chats, (key, value) => {
            return (
                <Tab label={key} id={key + "-chat"} key={key}>
                    <div className="row chatbox-top-stats-wrapper flex-items-xs-right">
                        <span className="float-xs-right chatbox-top-stats">
                            {value.users.length} users
                        </span>
                    </div>
                    <div className="row chatbox-message-list-wrapper">
                        <MessageList messages={value.messages}/>
                    </div>
                    <div className="row chatbox-input-send-wrapper">
                        <MessageSend />
                    </div>
                </Tab>
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
                <Tabs>
                    {this.renderTabContent(openThreads, activeThread)}
                </Tabs>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        activeThread: state.activeThread,
        openThreads: state.openThreads
    };
}

export default connect(mapStateToProps, {changeActiveThread}) (ChatViewer);
