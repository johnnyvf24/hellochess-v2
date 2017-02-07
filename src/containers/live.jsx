import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import ReactTimeout from 'react-timeout';
var Loading = require('react-loading');

import SearchBar from '../components/search_bar';
import BoardWrapper from './board/board_wrapper';
import RoomViewer from '../containers/room_viewer';
import NewGame from './new_game';
import PlayerTimes from './player_card/player_times';
import GameButtons from './game_btns';
import { logout, saveUsername, clearError, userConnect} from '../actions'

class Live extends Component {

    constructor(props) {
        super(props);

        this.state = {
            usernameInput: '',
            errorMessage: '',
        }

        this.onInputChange = this.onInputChange.bind(this);
        this.saveUsername = this.saveUsername.bind(this);
        this.saveUsername = this.saveUsername.bind(this);
        this.renderLiveContent = this.renderLiveContent.bind(this);
    }

    componentWillMount() {
        this.props.dispatch({
            type: 'server/get-rooms'
        });
        this.props.userConnect(this.props.profile);    //Connect the user to the server
    }

    logout() {
        this.props.logout();
        browserHistory.replace('/');
    }

    onCloseError(event) {
        console.log(this.props);
    }

    saveUsername(event) {
        const username = this.state.usernameInput;
        if(username.length > 3) {
            this.props.saveUsername(this.props.profile._id, username);
        }
        event.preventDefault();
    }

    onInputChange(event) {
        this.setState({usernameInput: event.target.value})
    }

    renderLiveContent() {
        if(!this.props.profile.username) {
            return <div></div>
        } else {
            return (
                <div id="wrapper" className="row">
                    <div id="chatbox-wrapper" className="hidden-sm-down col-md-4 col-lg-5">
                        <RoomViewer username=""/>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-5">
                        <div id="start-game-btns" className="row flex-items-xs-center">
                            <NewGame/>
                        </div>

                        <BoardWrapper />
                        <GameButtons />
                    </div>
                    <div id="time-ads-column" className="col-xs-12 col-sm-12 col-md-2 col-lg-2">
                        <PlayerTimes />
                    </div>
                </div>
            );
        }
    }

    renderInputUsername() {
        if(!this.props.profile.username) {
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
    }

    render() {
        if(this.props.connection.error) {
            return (
                <div>
                    <ModalContainer >
                      <ModalDialog>
                          <div className="row">
                              <strong className="center">Multiple Logins detected!</strong>
                          </div>
                          <p>Please check that only one tab is open or that you are only logged in on one device</p>
                      </ModalDialog>
                    </ModalContainer>
                </div>
            );
        }

        else if(!this.props.connection.status) {
            return (
                <div>
                    <div className="row">
                        <div className="center">
                            <Loading type='cylon' color='#e3e3e3' >
                            </Loading>
                        </div>

                    </div>
                    <div className="row">
                        <h2 id="main-loading-message" className="center">Connecting To Server</h2>
                    </div>
                </div>
            );
        }
        else {

            let {activeThread} = this.props;

            return (
                <div id="main-panel">
                    <div className="row flex-items-xs-right">
                        <div className="col-xs-10 col-md-6 col-lg-4">
                            
                        </div>
                        <div className="col-xs-2 col-md-4 col-lg-4">
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
                    { this.renderInputUsername() }

                    { this.renderLiveContent() }
                </div>
            )
        }

    }
}
function mapStateToProps(state) {
    return {
        profile: state.auth.profile,
        connection: state.connection,
    }
}

Live = ReactTimeout(Live);

export default connect (mapStateToProps, {logout, saveUsername, clearError, userConnect}) (Live);
