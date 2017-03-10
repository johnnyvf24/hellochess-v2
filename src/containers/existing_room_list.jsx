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

    renderRoomItems(rooms) {
        return mapObject( rooms, (key, value) => {
            if(!value.users) {
                return;
            }
            return (
                <tr key={value.id} onClick={this.onClickRoom.bind(this, key)}>
                    <td>{value.room.name}</td>
                    <td>{value.gameType}</td>
                    <td>{`${value.time.value}mins/${value.time.increment}secs` }</td>
                </tr>
            );
        });
    }

    render() {
        const { rooms } = this.props;

        //TODO add to filter-game-type
        // <Select
        //     name="game-type"
        //     value={"all"}
        //     options={gameTypeOptions}
        //     onChange={(event) => {}}
        // />
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
                <div className="col-xs-8 col-xs-10 col-md-12">
                    <table className="table-responsive table-sm table-curved">
                        <thead className="thead-inverse">
                            <tr>
                                <th>Title</th>
                                <th>Game Type</th>
                                <th>Time Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(this.renderRoomItems)}
                        </tbody>
                    </table>
                </div>
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
