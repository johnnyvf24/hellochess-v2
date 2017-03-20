import React, {Component} from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';

import CreateGameRoom from '../components/create_game/create_game_room';
import NewGameModalContent from '../components/create_game/new_game_modal_content';

import {Button, Modal} from 'react-bootstrap';


class NewGame extends Component {

    constructor(props) {
        super(props);

        this.renderModal = this.renderModal.bind(this);
        this.renderModalContent = this.renderModalContent.bind(this);
        this.state = { showModal: false };
    }
    
    close() {
        this.setState({ showModal: false });
    }
    
    open() {
        this.setState({ showModal: true });
    }

    renderModalContent() {
        if(this.props.makingGameRoom) {
            return <CreateGameRoom />
        } else {
            return <NewGameModalContent />
        }
    }

    renderModal() {

        return (
            <Modal show={this.state.showModal} onHide={this.close} id="new-game-modal">
                {this.renderModalContent()}
            </Modal>
        );
    }

    render() {
        return (
            <div>
                <Button
                    bsStyle="warning"
                    onClick={this.open.bind(this)}>
                    Play
                </Button>

                {this.renderModal()}
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        makingGameRoom: state.newGameOptions.isMakingGameRoom
    }
}

export default connect(mapStateToProps) (NewGame);
