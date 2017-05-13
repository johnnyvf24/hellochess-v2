import React, {Component} from 'react';
import RoomUserList from './room_user_list';
import MessageList from '../chat_message/message_list';
import RoomSettings from './room_settings';
import MessageSend from '../../containers/message_send';

import {Row, Col, Modal, Button} from 'react-bootstrap';


export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        }
    }
    
    shouldComponentUpdate(nextProps) {
        if(!this.props.value.room.name != nextProps.value.room.name) {
            return true;
        }
        if(nextProps.value.numMessages != this.props.value.numMessages) {
            return true;
        }
        return false;
    }
    
    openUserModal() {
        this.setState({
            showModal: true 
        });
    }
    
    closeUserModal() {
        this.setState({
            showModal: false 
        });
    }

    render() {
        const {index, value, active} = this.props;
        return (
            <div
                id={"room-chat-" + value.id}
                key={index} role="tabpanel"
                className= {index === active ? "tab-pane active" : "tab-pane"}>
                <Row className="chatbox-top-stats-wrapper">
                    <span className="chatbox-top-stats">
                        <RoomSettings value={value}/>
                        <a  className="pull-right num-user-modal-link"
                            href="#" onClick={this.openUserModal.bind(this)}>
                            {value.users.length} users
                        </a>
                        <Modal show={this.state.showModal} onHide={this.closeUserModal.bind(this)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Room Members</Modal.Title>
                            </Modal.Header>
                            <Modal.Body id="room-user-list-modal-body">
                                <RoomUserList users={value.users}/>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button onClick={this.closeUserModal.bind(this)}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                    </span>
                </Row>
                <Row className="chatbox-message-list-wrapper">
                    <MessageList messages={value.messages} thread={active} />
                </Row>
                <Row className="chatbox-input-send-wrapper">
                    <MessageSend />
                </Row>
            </div>
        )
    }
}
