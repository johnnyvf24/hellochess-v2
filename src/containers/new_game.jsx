import React, {Component} from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';

import NewGameModalContent from '../components/create_game/new_game_modal_content';

import {Button, Modal} from 'react-bootstrap';

import {createGameRoom, resetNewGameModal, finalizeGameRoom} from '../actions/create_game';


class NewGame extends Component {

    constructor(props) {
        super(props);

        this.renderModal = this.renderModal.bind(this);
        this.renderModalContent = this.renderModalContent.bind(this);
        this.state = { showModal: false };
    }
    
    close() {
        this.setState({ showModal: false });
        this.props.resetNewGameModal();
    }
    
    open() {
        this.setState({ showModal: true });
    }
    
    onCreateGame() {
        this.props.createGameRoom();
    }

    renderModalContent() {
        return (
            <NewGameModalContent
                roomNameRef={(input) => this.roomNameInput = input}
                />
        );
    }
    
    submitRoom() {
        this.props.resetNewGameModal();
        this.props.room.name = this.roomNameInput.value;
        this.props.finalizeGameRoom(this.props.game, this.props.profile);
        this.close();
    }
    
    renderModalFooter() {
        return (
            <div>
                <Button onClick={this.close.bind(this)}>
                    Cancel
                </Button>
                <Button bsStyle="primary" onClick={this.submitRoom.bind(this)}>
                    Create Room
                </Button>
            </div>
        );
    }

    renderModal() {

        return (
            <Modal show={this.state.showModal} onHide={this.close.bind(this)} id="new-game-modal">
                <Modal.Header closeButton>
                    <Modal.Title>New Game Room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderModalContent()}
                </Modal.Body>
                <Modal.Footer>
                    {this.renderModalFooter()}
                </Modal.Footer>
            </Modal>
        );
    }

    render() {
        return (
            <div id="new-game-button-wrapper">
                <Button
                    bsStyle="primary"
                    onClick={this.open.bind(this)}>
                    New Room
                </Button>

                {this.renderModal()}
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        makingGameRoom: state.newGameOptions.isMakingGameRoom,
        room: state.newGameOptions.room,
        game: state.newGameOptions,
        profile: state.auth.profile
    }
}

export default connect(mapStateToProps, {createGameRoom, resetNewGameModal, finalizeGameRoom}) (NewGame);
