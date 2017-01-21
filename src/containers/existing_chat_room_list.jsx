import React, {Component} from 'react';
import Select from 'react-select';
import { connect } from 'react-redux';
import CreateChatRoom from '../containers/create_chat_room';
import { mapObject } from '../utils/'
import {joinRoom} from '../actions/';

const gameTypeOptions = [
    { value: 'all', label: 'All Games'},
    { value: 'two-player', label: 'Two Player'},
    { value: 'four-player', label: 'Four Player'},
    { value: 'four-player-team', label: 'Four Player Teams'}
]


class ExistingChatRoomList extends Component {
    constructor (props) {
        super(props)

        this.renderChatRoomItems = this.renderChatRoomItems.bind(this);
    }

    onClickRoom(key, event) {
        this.props.joinRoom(key);
    }

    renderChatRoomItems(chatRoom) {
        return mapObject( chatRoom, (key, value) => {
            return (
                <tr key={key} onClick={this.onClickRoom.bind(this, key)}>
                    <td>{value.name}</td>
                    <td>Two Player</td>
                    <td>5min/2sec</td>
                    <td>1245</td>
                    <td>10</td>
                    <td>Yes</td>
                    <td>No</td>
                </tr>
            );
        });
    }

    render() {
        const { chatRooms } = this.props;
        return (
            <div
                id="chat-list"
                className="tab-pane"
                role="tabpanel">
                <div className="row chatbox-top-stats-wrapper">
                    <span className="chatbox-top-stats">
                        <div className="row">
                            <div className="col-xs-4"></div>
                            <div className="col-xs-4">
                                <div id="filter-game-type" className="col-xs-12">
                                    <Select
                                        name="game-type"
                                        value={"all"}
                                        options={gameTypeOptions}
                                        onChange={(event) => {}}
                                    />
                                </div>
                            </div>
                            <div className="col-xs-4">
                            <a className="float-xs-right">
                                {chatRooms.length} Game Rooms
                            </a>
                            </div>
                        </div>
                    </span>
                </div>

                <table className="table table-responsive table-sm table-curved">
                    <thead className="thead-inverse">
                        <tr>
                            <th>Title</th>
                            <th>Game Type</th>
                            <th>Time Control</th>
                            <th>Average Elo</th>
                            <th># of players</th>
                            <th>{"Private?"}</th>
                            <th>{"Voice?"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chatRooms.map(this.renderChatRoomItems)}
                    </tbody>
                </table>
                <CreateChatRoom />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        chatRooms: state.existingChatRooms
    }
}

export default connect(mapStateToProps, {joinRoom}) (ExistingChatRoomList)
