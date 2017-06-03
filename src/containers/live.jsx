import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import ReactTimeout from 'react-timeout';
import {LinkContainer} from 'react-router-bootstrap';
var Loading = require('react-loading');

import SearchBar from '../components/search_bar';
import BoardWrapper from './board/board_wrapper';
import RoomViewer from '../containers/room_viewer';
import NewGame from './new_game';
import PlayerTimes from './player_card/player_times';
import GameButtons from './game_btns';
import NotificationHandler from './notification_handler';
import { logout, saveUsername, clearError, userConnect, changeZoom} from '../actions';
import {enableMic, disableMic } from '../actions/room';
import Slider, { Range } from 'rc-slider';

import {Grid, Row, Col, Button, Dropdown, MenuItem, Alert, ButtonGroup} from 'react-bootstrap';

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
      <div className="dropdown-menu dropdown-menu-right" id="profile-menu">
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
        let showDevAlert = JSON.parse(localStorage.getItem('showDevAlert1'));
        if (typeof showDevAlert === "undefined" || showDevAlert === null)
            showDevAlert = true;
        let zoomLevel = JSON.parse(localStorage.getItem('zoomLevel'));
        if (typeof zoomLevel === "undefined" || zoomLevel === null)
            zoomLevel = 100;
        this.state.enableSounds = enableSounds;
        this.state.alertVisible = showDevAlert;
        this.props.changeZoom(zoomLevel);
        let widths = this.zoomLevelToWidths(zoomLevel);
        this.state.boardZoom = widths.boardZoom;
        this.state.chatZoom = widths.chatZoom;
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
            if(this.props.activeThread !== 200) {
                let chatWidth = this.state.chatZoom + '%';
                let boardWidth = this.state.boardZoom + '%';
                return (
                    <Row id="wrapper">
                        <Col className="chat-board-wrapper" xs={0} sm={10} md={10} lg={10}>
                            <Row className="chat-board-wrapper">
                                <Col
                                    id="chatbox-wrapper"
                                    xs={6} sm={6} md={6} lg={6}
                                    style={{"width": chatWidth}}>
                                    <RoomViewer />
                                </Col>
                                <Col
                                    id="board-column-wrapper"
                                    xs={6} sm={6} md={6} lg={6}
                                    style={{"width": boardWidth}}>
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
            } else {
                return (
                    <Row id="wrapper">
                        <Col xs={0} sm={4} md={4} lg={5} style={{"height":"100%"}}>
                            <RoomViewer />
                        </Col>
                        <Col xs={12} sm={8} md={8} lg={7}>
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
        localStorage.setItem('showDevAlert1', false);
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
    
    zoomLevelToWidths(zoomLevel) {
        const defaultChat = 44;
        const defaultBoard = 56;
        let boardZoom = defaultBoard * (zoomLevel / 100);
        let chatZoom = 100 - boardZoom;
        return {boardZoom, chatZoom};
    }
    
    onChangeZoom(value) {
        let {boardZoom, chatZoom} = this.zoomLevelToWidths(value);
        this.props.changeZoom(value);
        this.setState({
            boardZoom,
            chatZoom
        });
        localStorage.setItem("zoomLevel", value);
    }
    
    renderProfileMenu() {
        let enableSounds = this.state.enableSounds;
        let soundMenuString = `Move sounds ${enableSounds ? '✔' : ''}`;
        return (
            <Dropdown id="dropdown-custom-menu" pullRight={true} rootCloseEvent="mousedown">
                <CustomToggle bsRole="toggle" id="profile-toggle" rootCloseEvent="mousedown">
                    <img
                        id="profile-pic"
                        className="img-responsive img-circle"
                        src={this.props.profile.picture} alt="" />
                </CustomToggle>
                <CustomMenu bsRole="menu" id="profile-menu" rootCloseEvent="click">
                    <MenuItem onClick={this.onProfileClick.bind(this)} eventKey="1">Profile</MenuItem>
                    <MenuItem onClick={this.toggleSounds.bind(this)} eventKey="2">
                        {soundMenuString}
                    </MenuItem>
                    <MenuItem eventKey="3">
                        <div id="zoom-text">Board zoom: {this.props.zoomLevel}%</div>
                        <Slider
                            value={this.props.zoomLevel}
                            onChange={this.onChangeZoom.bind(this)}
                            step={5}
                            max={125}
                            min={20} />
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem onClick={this.logout.bind(this)} eventKey="4">Log out</MenuItem>
                </CustomMenu>
            </Dropdown>
        );
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
                    {this.state.alertVisible && 
                    <Alert
                        bsStyle="success"
                        onDismiss={this.handleAlertDismiss.bind(this)}
                        style={{
                            position: 'absolute',
                            width: '600px',
                            textAlign: 'center',
                            zIndex: '999',
                            paddingBottom: '10px',
                            paddingTop: '10px',
                            margin: '0 auto',
                            left: '25%',
                            right: '25%'
                        }}>
                        <i className="fa fa-wrench fa-lg" aria-hidden="true"></i>
                        <strong> Please note this site is under active development.</strong>
                        <p>
                            Check out our new variant: <b>S-Chess</b>! 
                            Learn the rules&nbsp;
                            <a href="https://en.wikipedia.org/wiki/Seirawan_chess" target="_blank">
                                here
                            </a> 
                            &nbsp;and report any bugs or issues on&nbsp;
                            <a href="https://github.com/johnnyvf24/hellochess-v2/issues" target="_blank">
                                our GitHub issues page
                            </a>
                            .
                        </p>
                    </Alert>
                    }
                    <Row>
                        <NewGame/>
                        <div className="pull-right">
                            <div id="leaderboard-button-wrapper">
                            <ButtonGroup>
                                <LinkContainer
                                    id="leaderboard-button"
                                    to={{pathname: '/leaderboard'}}>
                                    <Button>
                                        Leaderboard
                                    </Button>
                                </LinkContainer>
                                <LinkContainer
                                    to={{pathname: '/players'}}>
                                    <Button bsStyle="info">
                                        Players
                                    </Button>
                                </LinkContainer>
                             </ButtonGroup>
                            
                                
                                
                            </div>
                            {this.renderProfileMenu()}
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
        zoomLevel: state.settings.zoomLevel
    }
}

Live = ReactTimeout(Live);

export default connect (mapStateToProps,
    {logout, saveUsername, clearError,
     userConnect, enableMic, disableMic,
     enableMic, disableMic, changeZoom
    }
) (Live);
