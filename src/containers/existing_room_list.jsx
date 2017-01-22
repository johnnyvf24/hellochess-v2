import React, {Component} from 'react';
import Select from 'react-select';
import { connect } from 'react-redux';
import { mapObject } from '../utils/'
import {joinRoom} from '../actions/';

const gameTypeOptions = [
    { value: 'all', label: 'All Games'},
    { value: 'two-player', label: 'Two Player'},
    { value: 'four-player', label: 'Four Player'},
    { value: 'four-player-team', label: 'Four Player Teams'}
]


class ExistingRoomList extends Component {
    constructor (props) {
        super(props)

        this.renderRoomItems = this.renderRoomItems.bind(this);
    }

    onClickRoom(key, event) {
        this.props.joinRoom(key);
    }

    renderRoomItems(room) {
        return mapObject( room, (key, value) => {
            return (
                <tr key={key} onClick={this.onClickRoom.bind(this, key)}>
                    <td>{value.room.name}</td>
                    <td>{value.room.gameType}</td>
                    <td>{`${value.time.value}mins/${value.time.increment}secs` }</td>
                    <td>1245</td>
                    <td>10</td>
                    <td>Yes</td>
                    <td>No</td>
                </tr>
            );
        });
    }

    render() {
        const { rooms } = this.props;
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
                                {rooms.length} Game Rooms
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
                        {rooms.map(this.renderRoomItems)}
                    </tbody>
                </table>
            </div>
        );
    }
}

function mapStateToProps(state) {
    // console.log(state);
    return {
        rooms: state.rooms
    }
}

export default connect(mapStateToProps, {joinRoom}) (ExistingRoomList)
