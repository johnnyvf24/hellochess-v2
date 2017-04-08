import React, { Component, PropTypes } from 'react';
import { connect, bindActionCreators } from 'react-redux';
import { Link } from 'react-router';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import YouTube from 'react-youtube';
import { loginUser, signUpUser, fbLoginUser, googleLoginUser } from '../actions/index';
import App from './app';
import SignUpForm from '../components/auth/signup_form';
import LoginForm from '../components/auth/login_form';
import config from '../../config/config';

import TwoBoard from '../components/demo_board/two_board';
import FourBoard from '../components/demo_board/four_board';

import {Row, Col, Clearfix, Button, Panel, PanelGroup, Accordion, Grid} from 'react-bootstrap';

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
    
    componentWillMount() {
        this.refs.signupCol
    }

    render() {
        const { errorMessage } = this.props;
        
        const opts = {
            height: '500px',
            width: '100%',
            playerVars: { // https://developers.google.com/youtube/player_parameters 
                autoplay: 0
            },
            
        };
        return (
                <Row>
                    <Col xs={12} sm={3} md={3} lg={3} ref="signupCol">
                        <h1 className="reg-login-header">Sign Up</h1>
                        <SignUpForm onSubmit={this.onSignUpSubmit.bind(this)} />
                    
                    </Col>
                    <Col xs={0} sm={6} md={6} lg={6}>
                        <Col sm={6}>
                            <FacebookLogin
                                appId={config.facebookAuth.clientID}
                                autoLoad={false}
                                fields={config.facebookAuth.fields}
                                callback={this.fbCallback.bind(this)}
                                scope="public_profile,user_friends,email"
                                cssClass="btn btn-block btn-social btn-facebook"
                                icon="fa fa-facebook"
                            />
                        </Col>
                        <Col sm={6}>
                            <GoogleLogin
                                clientId={config.googleAuth.GoogleClientID}
                                onSuccess={this.googleCallback.bind(this)}
                                className="btn btn-block btn-social btn-google">
                                Connect with Google
                                <span className="fa fa-google"></span>
                            </GoogleLogin>
                        </Col>
                        <Col sm={12}>
                            <div className="landing-card">
                                <YouTube
                                    videoId="ZAEa0vqw2fg"
                                    opts={opts}
                                    onReady={this._onReady}
                                    className="landing-video"
                                />
                            </div>
                        </Col>
                    </Col>
                    <Col xs={12} sm={3} md={3} lg={3} >
                        <h1 className="reg-login-header">Login</h1>
                        <LoginForm onSubmit={this.onLoginSubmit.bind(this)} />
        
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
