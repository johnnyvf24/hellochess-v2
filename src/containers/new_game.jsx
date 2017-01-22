import React, {Component} from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';

import CreateGameRoom from '../components/create_game/create_game_room';
import NewGameModalContent from '../components/create_game/new_game_modal_content';


class NewGame extends Component {

    constructor(props) {
        super(props);

        this.renderModal = this.renderModal.bind(this);
        this.renderModalContent = this.renderModalContent.bind(this);
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
            <div className="modal fade"
                id="new-game-modal"
                role="dialog"
                aria-hidden="true"
                data-backdrop="static">
                <div className="modal-dialog" role="document">
                    {this.renderModalContent()}
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                <button
                    type="button"
                    className="btn btn-warning"
                    data-toggle="modal"
                    data-target="#new-game-modal">
                    Play
                </button>

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
