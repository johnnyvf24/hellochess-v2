import React, {Component} from 'react';
import ExistingChatRoomList from '../containers/existing_chat_room_list';

function AvailableRooms(props) {
    return (
        <div id="right-bottom" className="col-xs-12">
            <ul className="nav nav-tabs nav-justified" id="myTab" role="tablist">
                <li className="nav-item">
                    <a className="nav-link active" data-toggle="tab" href="#home" role="tab" aria-controls="home">Four Player</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#profile" role="tab" aria-controls="profile">Two Player</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#messages" role="tab" aria-controls="messages">Friends</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#chat-room-list" role="tab" aria-controls="settings">Chat Rooms</a>
                </li>
            </ul>

            <div className="tab-content">
                <div className="tab-pane active" id="home" role="tabpanel">stuff</div>
                <div className="tab-pane" id="profile" role="tabpanel">stuff2</div>
                <div className="tab-pane" id="messages" role="tabpanel">adsfasdf</div>
                <ExistingChatRoomList />
            </div>
        </div>
    );
}

export default AvailableRooms;
