import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import ReactTimeout from 'react-timeout';
import {LinkContainer} from 'react-router-bootstrap';
var Loading = require('react-loading');

import GameHistory from './game_history';
import SearchBar from '../components/search_bar';
import BoardWrapper from './board/board_wrapper';
import RoomViewer from '../containers/room_viewer';
import NewGame from './new_game';
import PlayerTimes from './player_card/player_times';
import GameButtons from './game_btns';
import NotificationHandler from './notification_handler';
import { logout, saveUsername, clearError, userConnect} from '../actions';
import {enableMic, disableMic } from '../actions/room';

import {Grid, Row, Col, Button, Dropdown, MenuItem, Alert} from 'react-bootstrap';

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
            usernameValid: false,
            errorMessage: '',
            alertVisible: true
        }
        let enableSounds = JSON.parse(localStorage.getItem('enableSounds'));
        if (typeof enableSounds === "undefined" || enableSounds === null)
            enableSounds = true;
        let showDevAlert = JSON.parse(localStorage.getItem('showDevAlert'));
        if (typeof showDevAlert === "undefined" || showDevAlert === null)
            showDevAlert = true;
        this.state.enableSounds = enableSounds;
        this.state.alertVisible = showDevAlert;
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
        if(this.usernameValid(username)) {
            this.props.saveUsername(this.props.profile._id, username);
        }
        event.preventDefault();
    }
    
    usernameValid(username) {
        return username.length > 3;
    }

    onInputChange(event) {
        this.setState({
            usernameInput: event.target.value,
            usernameValid: this.usernameValid(event.target.value)
        });
    }
    
    toggleSounds() {
        let enableSounds = JSON.parse(localStorage.getItem('enableSounds'));
        if (typeof enableSounds === "undefined" || enableSounds === null) {
            enableSounds = false;
        } else {
            enableSounds = !enableSounds;
        }
        this.setState({enableSounds});
        localStorage.setItem('enableSounds', enableSounds);
    }

    renderLiveContent() {
        if(!this.props.profile.username) {
            return <div></div>
        } else {
            if(this.props.activeThread != "200")
                return (
                    <Row id="wrapper">
                        <Col className="chat-board-wrapper" xs={0} sm={10} md={10} lg={10}>
                            <Row className="chat-board-wrapper">
                                <Col id="chatbox-wrapper" xs={6} sm={6} md={6} lg={6}>
                                    <RoomViewer />
                                </Col>
                                <Col id="board-column-wrapper" xs={6} sm={6} md={6} lg={6}>
                                    <BoardWrapper />
                                </Col>
                            </Row>
                        </Col>
                        <Col id="time-ads-column" xs={12} sm={2} md={2} lg={2}>
                            <PlayerTimes />
                            <GameButtons />
                        </Col>
                        <NotificationHandler />
                    </Row>
                );
                
            else {
                return (
                    <Row id="wrapper">
                        <Col xs={0} sm={4} md={4} lg={5} style={{"height":"100%"}}>
                            <RoomViewer />
                        </Col>
                        <Col xs={12} sm={8} md={8} lg={7}>
                            <GameHistory />
                        </Col>
                    </Row>
                );
            }
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
                              className="form-control"/>
                          <button
                              type="submit"
                              className="btn btn-warning btn-save-username float-xs-right"
                              disabled={!this.state.usernameValid}>
                              Save
                         </button>
                     </form>
                  </ModalDialog>
                </ModalContainer>
            );
        }
    }
    
    handleAlertDismiss() {
        localStorage.setItem('showDevAlert', false);
        this.setState({alertVisible: false});
    }
    
    renderMicrophoneStatus() {
        if(!this.props.openThread || !this.props.openThread.room.voiceChat) {
            return;
        }
        if(this.props.enabledVoice == false || !this.props.enabledVoice)
            return (
                <a className="mic-status" onClick={(e) => this.props.enableMic(this.props.activeThread)}>
                    <span className="fa-stack fa-2x">
                        <i className="fa fa-circle fa-stack-2x fa-inverse"></i>
                        <i className="fa fa-microphone-slash fa-stack-1x fa-inverse"></i>
                    </span>
                </a>
            ); 
        else {
            return (
            <a className="mic-status" onClick={(e) => this.props.disableMic(this.props.activeThread)}>
                <span className="fa-stack fa-2x">
                    <i className="fa fa-circle fa-stack-2x fa-inverse"></i>
                    <i className="fa fa-microphone fa-stack-1x fa-inverse"></i>
                </span>
            </a>
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
            let enableSounds = this.state.enableSounds;
            let soundMenuString = `Move sounds ${enableSounds ? '✔' : ''}`;

            return (
                <div id="main-panel">
                    <Row>
                        <NewGame/>
                        {this.state.alertVisible && 
                        <Col xs={12} sm={10} md={8} lg={6}>
                            <Alert
                                bsStyle="success"
                                onDismiss={this.handleAlertDismiss.bind(this)}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    textAlign: 'center',
                                    zIndex: '999',
                                    paddingBottom: '10px',
                                    paddingTop: '10px'
                                }}>
                                <i className="fa fa-wrench fa-lg" aria-hidden="true"></i>
                                <strong> Please note this site is under active development!</strong>
                                <p>
                                    What feature should we add to Hellochess next?
                                    &nbsp;
                                    <a href="https://strawpoll.com/54cd271" target="_blank">
                                        Vote here!
                                    </a>
                                </p>
                            </Alert>
                        </Col> 
                        }
                        <div className="pull-right">
                            <div id="leaderboard-button-wrapper">
                                <LinkContainer
                                    id="leaderboard-button"
                                    to={{pathname: '/leaderboard'}}>
                                    <Button>
                                        Leaderboard
                                    </Button>
                                </LinkContainer>
                            </div>
                            <Dropdown id="dropdown-custom-menu">
                                <CustomToggle bsRole="toggle">
                                    <img id="profile-pic" className="img-responsive img-circle" src={this.props.profile.picture} alt="" />
                                </CustomToggle>
                                <CustomMenu bsRole="menu">
                                    <MenuItem onClick={this.onProfileClick.bind(this)} eventKey="1">Profile</MenuItem>
                                    <MenuItem onClick={this.toggleSounds.bind(this)} eventKey="2">
                                        {soundMenuString}
                                    </MenuItem>
                                    <MenuItem divider />
                                    <MenuItem onClick={this.logout.bind(this)} eventKey="3">Log out</MenuItem>
                                </CustomMenu>
                            </Dropdown>
                        </div>
                        <div className="pull-right">
                        {this.renderMicrophoneStatus() }
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
    let openThread = state.openThreads[state.activeThread];
    let enabledVoice = false, streamingVoice = false;
    if(openThread) {
        enabledVoice = openThread.enabledVoice;
    }
    return {
        profile: state.auth.profile,
        connection: state.connection,
        openThread,
        activeThread: state.activeThread,
        enabledVoice,
    }
}

Live = ReactTimeout(Live);

export default connect (mapStateToProps,
    {logout, saveUsername, clearError,
     userConnect, enableMic, disableMic,
     enableMic, disableMic
    }
) (Live);
