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
import { logout, saveUsername, clearError, userConnect} from '../actions';

import {Grid, Row, Col, Button, Dropdown, MenuItem} from 'react-bootstrap';

class CustomToggle extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();

    this.props.onClick(e);
  }

  render() {
    return (
      <a href="" onClick={this.handleClick}>
        {this.props.children}
      </a>
    );
  }
}

class CustomMenu extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onChange = e => this.setState({ value: e.target.value });

    this.state = { value: '' };
  }

  focusNext() {
    const input = ReactDOM.findDOMNode(this.input);

    if (input) {
      input.focus();
    }
  }

  render() {
    const { children } = this.props;
    const { value } = this.state;

    return (
      <div className="dropdown-menu dropdown-menu-right" style={{ padding: '' }}>
         {React.Children.toArray(children).filter(child => (
            !value.trim() || child.props.children.indexOf(value) !== -1
            ))}
        <ul className="list-unstyled">
            
        </ul>
      </div>
    );
  }
}

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
        if(!this.props.connection.status) {
            this.props.userConnect(this.props.profile);    //Connect the user to the server
        }
    }

    logout() {
        let profile = this.props.profile;
        this.props.logout(profile);
        browserHistory.replace('/');
    }

    onCloseError(event) {
        console.log(this.props);
    }

    onProfileClick(event) {
        event.preventDefault();
        browserHistory.push(`/profile/${this.props.profile._id}`);
    }

    saveUsername(event) {
        const username = this.state.usernameInput;
        if(username.length > 1) {
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
                <Row id="wrapper">
                    <Col id="chatbox-wrapper" xs={0} sm={0} md={4} lg={5}>
                        <RoomViewer />
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={5}>
                        <Row id="start-game-btns">
                            <div className="text-center">
                                <NewGame/>
                            </div>
                        </Row>

                        <BoardWrapper />
                        <GameButtons />
                    </Col>
                    <div id="time-ads-column" className="col-xs-12 col-sm-12 col-md-2 col-lg-2">
                        <PlayerTimes />
                    </div>
                </Row>
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
                <Grid>
                    <Row>
                        <div className="center">
                            <Loading type='cylon' color='#e3e3e3' >
                            </Loading>
                        </div>

                    </Row>
                    <Row>
                        <h2 id="main-loading-message" className="center">Connecting To Server</h2>
                    </Row>
                </Grid>
            );
        }
        else {
        
            let {activeThread} = this.props;

            return (
                <div id="main-panel">
                    <Row>
                        <div className="pull-right">
                            <Dropdown id="dropdown-custom-menu">
                                <CustomToggle bsRole="toggle">
                                    <img id="profile-pic" className="img-responsive rounded-circle" src={this.props.profile.picture} alt="" />
                                </CustomToggle>
                                <CustomMenu bsRole="menu">
                                    <MenuItem onClick={this.onProfileClick.bind(this)} eventKey="1">Profile</MenuItem>
                                    <MenuItem divider />
                                    <MenuItem onClick={this.logout.bind(this)} eventKey="2">Logout</MenuItem>
                                </CustomMenu>
                                
                            </Dropdown>
                        </div>
                    </Row>
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
