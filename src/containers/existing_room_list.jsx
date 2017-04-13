import React, {Component} from 'react';
import Select from 'react-select';
import { connect } from 'react-redux';
import { mapObject } from '../utils/'
import { joinRoom } from '../actions/';

import {Row, Col, Button, Table} from 'react-bootstrap';

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
        if(!room.numPlayers) {
            return;
        }
        return (
            <tr key={room.id} onClick={this.onClickRoom.bind(this, room.room.name)}>
                <td>{room.room.name}</td>
                <td>{room.gameType}</td>
                <td>{`${room.time.value}mins/${room.time.increment}secs` }</td>
                <td>{room.numPlayers}</td>
            </tr>
        );
    }

    render() {
        const { rooms } = this.props;
        return (
            <div id="chat-list">
                <Row className="chatbox-top-stats-wrapper">
                    <span className="chatbox-top-stats">
                        <Row>
                            <Col xs={4}></Col>
                            <div className="col-xs-4">
                                <div id="filter-game-type" className="col-xs-12">

                                </div>
                            </div>
                            <Col xs={4}>
                                <a className="pull-right num-user-modal-link">
                                    {rooms.length} Game Rooms
                                </a>
                            </Col>
                        </Row>
                    </span>
                </Row>
                <Col md={12}>
                    <Table responsive>
                        <thead className="thead-inverse">
                            <tr>
                                <th>Title</th>
                                <th>Game Type</th>
                                <th>Time Control</th>
                                <th># Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(this.renderRoomItems)}
                        </tbody>
                    </Table>
                </Col>
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
