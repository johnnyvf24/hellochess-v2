import React, { Component, PropTypes } from 'react';
import { connect, bindActionCreators } from 'react-redux';
import { Link } from 'react-router';
import FacebookLogin from 'react-facebook-login';
import { loginUser, signUpUser, fbLoginUser } from '../../actions/index';
import App from '../app';
import SignUpForm from './signup_form';
import LoginForm from './login_form';
import config from '../../../config/config';

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

    render() {
        const { errorMessage } = this.props;
        return (
            <div className="row">
                <div className="hidden-sm-down col-md-4 col-lg-4">
                    <div id="four-player-demo">

                    </div>
                </div>
                <div className="col-xs-12 col-md-4 col-lg-4">
                    <div className="card card-container landing-card">
                        <div className="panel-group">
                            <FacebookLogin
                                appId={config.facebookAuth.clientID}
                                autoLoad={false}
                                fields={config.facebookAuth.fields}
                                callback={this.fbCallback.bind(this)}
                                scope="public_profile,user_friends,email"
                                cssClass="btn btn-block btn-social btn-facebook"
                                icon="fa fa-facebook" />

                            <a href="" className="btn btn-block btn-social btn-google">
                                <span className="fa fa-google"></span> Google
                            </a>
                        </div>
                        <hr />

                        <a href="#signUp"
                            id="signUpShower"
                            className="btn btn-warning btn-block"
                            data-toggle="collapse"
                            aria-expanded="false">
                            Sign Up
                        </a>
                        <div id="signUp" className="collapse">
                            <SignUpForm onSubmit={this.onSignUpSubmit.bind(this)} />
                        </div>

                        <a href="#logIn"
                            id="LoginShower"
                            className="btn btn-warning btn-block"
                            data-toggle="collapse"
                            aria-expanded="False">
                            Log In
                        </a>
                        <div id="logIn" className="collapse">
                            <LoginForm onSubmit={this.onLoginSubmit.bind(this)} />
                        </div>
                    </div>


                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="Enter a temporary username" />
                        <span className="input-group-btn">
                            <button className="btn btn-secondary" type="submit">Play as Guest</button>
                        </span>
                    </div>
                </div>
                <div className="hidden-sm-down col-md-4 col-lg-4">
                    <div id="two-player-demo">

                    </div>
                </div>
            </div>

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

export default connect (mapStateToProps, {loginUser, signUpUser, fbLoginUser}) (AuthCard);
