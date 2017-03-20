import React, { Component, PropTypes } from 'react';
import { connect, bindActionCreators } from 'react-redux';
import { Link } from 'react-router';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import { loginUser, signUpUser, fbLoginUser, googleLoginUser } from '../actions/index';
import App from './app';
import SignUpForm from '../components/auth/signup_form';
import LoginForm from '../components/auth/login_form';
import config from '../../config/config';

import TwoBoard from '../components/demo_board/two_board';
import FourBoard from '../components/demo_board/four_board';

import {Row, Col, Clearfix, Button, Panel, PanelGroup, Accordion} from 'react-bootstrap';

class AuthCard extends Component {

    onSignUpSubmit(values) {
        this.props.signUpUser(values);
    }

    onLoginSubmit(values) {

        this.props.loginUser(values);
    }

    fbCallback(response) {
        //send user credentials to server
        this.props.fbLoginUser(response.accessToken);
    }

    googleCallback(response) {
        this.props.googleLoginUser(response.accessToken);
    }

    render() {
        const { errorMessage } = this.props;
        return (
            <Row>
                <Col xs={0} md={4} lg={4} >
                    <div id="four-player-demo">
                        <FourBoard />
                    </div>
                </Col>
                <Col xs={12} md={4} lg={4}>
                    <Panel className="landing-card">
                        <PanelGroup>
                            <FacebookLogin
                                    appId={config.facebookAuth.clientID}
                                    autoLoad={false}
                                    fields={config.facebookAuth.fields}
                                    callback={this.fbCallback.bind(this)}
                                    scope="public_profile,user_friends,email"
                                    cssClass="btn btn-block btn-social btn-facebook"
                                    icon="fa fa-facebook"
                                />
                        </PanelGroup>
                        <PanelGroup>
                            <GoogleLogin
                                clientId={config.googleAuth.GoogleClientID}
                                onSuccess={this.googleCallback.bind(this)}
                                className="btn btn-block btn-social btn-google">
                                Connect with Google
                                <span className="fa fa-google"></span>
                            </GoogleLogin>
                        </PanelGroup>
                        <hr />
                        <PanelGroup defaultActiveKey="2" accordion>
                            <Panel header="Sign Up" eventKey="1">
                                <SignUpForm onSubmit={this.onSignUpSubmit.bind(this)} />
                            </Panel>
                            <Panel header="Log In" eventKey="2">
                                <LoginForm onSubmit={this.onLoginSubmit.bind(this)} />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </Col>
                <Col xs={0} md={4} lg={4} >
                    <div id="two-player-demo">
                        <TwoBoard />
                    </div>
                </Col>
            </Row>

        );
    }
}

App.contextTypes = {
  store: PropTypes.object
};

function mapStateToProps(state) {
    return {
        errorMessage: state.auth.error,
    };
}

export default connect (mapStateToProps, {loginUser, signUpUser, fbLoginUser, googleLoginUser}) (AuthCard);
