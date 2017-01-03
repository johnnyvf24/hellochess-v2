import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

import SearchBar from './search_bar';
import TwoBoard from './two_board';
import ChatViewer from './chat_viewer';
import NewGame from './new_game';
import AvailableRooms from './available_rooms';
import { logout, saveUsername } from '../actions'

class Live extends Component {

    constructor(props) {
        super(props);

        this.state = {
            usernameInput: '',
            errorMessage: '',
        }

        this.onInputChange = this.onInputChange.bind(this);
        this.saveUsername = this.saveUsername.bind(this);
    }

    logout() {
        this.props.logout();
        browserHistory.replace('/login')
    }

    saveUsername(event) {
        const username = this.state.usernameInput;
        if(username.length > 3) {
            this.props.saveUsername(this.props.profile.user_id, username);
        }
        event.preventDefault();
    }

    onInputChange(event) {
        this.setState({usernameInput: event.target.value})
    }

    renderInputUsername() {
        if(this.props.profile.user_metadata) {
            return;
        }

        return (
            <ModalContainer >
              <ModalDialog>
                  <form onSubmit={this.saveUsername} >
                      <h2>Enter a username</h2>
                      <input
                          value={this.state.usernameInput}
                          onChange={this.onInputChange}
                          className="form-control"
                          placeholder="Type here..."/>
                      <button
                          type="submit"
                          className="btn btn-warning btn-save-username float-xs-right">
                          Save
                     </button>
                 </form>
              </ModalDialog>
            </ModalContainer>
        );
    }

    render() {
        if(!this.props.profile) {
            return (
                <div>Loading...</div>
            )
        }
        return (
            <div>
                <div className="row">
                    <div className="col-xs-4">
                        { this.renderInputUsername() }
                    </div>
                    <div className="col-xs-4">
                        <SearchBar/>
                    </div>
                    <div className="col-xs-4">
                        <div className="dropdown float-xs-right">
                            <a className="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <img id="profile-pic" className="img-fluid rounded-circle" src={this.props.profile.picture} alt="" />
                            </a>

                            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
                                <a className="dropdown-item" onClick={this.logout.bind(this)} href="#">Logout</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <ChatViewer username=""/>
                    <div className="col-sm-6"></div>
                    <div className="col-sm-6 text-xs-center">
                        <NewGame/>
                        <div className="row">
                            <div className="hidden-md-down col-lg-3"></div>
                            <div className="col-lg-6">
                                <TwoBoard/>
                            </div>
                            <div className="hidden-md-down col-lg-3"></div>
                        </div>
                        <AvailableRooms/>
                    </div>
                </div>
            </div>
        )
    }
}
function mapStateToProps(state) {
    return {profile: state.auth.profile}
}

export default connect (mapStateToProps, {logout, saveUsername}) (Live);
