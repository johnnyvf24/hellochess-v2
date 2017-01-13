import React, {Component} from 'react';
import ExistingChatRoomList from '../containers/existing_chat_room_list';
import FourPlayerRoomList from '../containers/four_player_room_list';

function AvailableRooms(props) {
    return (
        <div id="right-bottom" className="col-xs-12">
            <ul className="nav nav-tabs nav-justified" id="myTab" role="tablist">
                <li className="nav-item">
                    <a className="nav-link active"
                         data-toggle="tab"
                         href="#four-player-room-list"
                         role="tab"
                         aria-controls="four-player-room-list">
                         Four Player
                     </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link"
                        data-toggle="tab"
                        href="#two-player-room-list"
                        role="tab"
                        aria-controls="two-player-room-list">
                        Two Player
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link"
                        data-toggle="tab"
                        href="#friends-list"
                        role="tab"
                        aria-controls="friends-list">
                        Friends
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#chat-room-list" role="tab" aria-controls="settings">Chat Rooms</a>
                </li>
            </ul>

            <div className="tab-content">
                <FourPlayerRoomList />
                <div className="tab-pane"
                    id="two-player-room-list"
                    role="tabpanel">Two player</div>
                <div className="tab-pane" id="friends-list" role="tabpanel">friends</div>
                <ExistingChatRoomList />
            </div>
        </div>
    );
}

export default AvailableRooms;
