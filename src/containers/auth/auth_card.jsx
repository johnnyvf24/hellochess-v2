import React, { Component } from 'react';
import { connect, bindActionCreators } from 'react-redux';
import { login, doAuthentication } from '../../actions/index'
import SignUpForm from './signup_form';
import LoginForm from './login_form';

class AuthCard extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.props.doAuthentication();
    }

    onClick(event) {
        this.props.onLoginClick();
    }

    onSignUpSubmit(values) {
        const {signUpEmail, signUpPassword} = values;

        console.log(signUpEmail, signUpPassword);
    }

    onLoginSubmit(values) {
        console.log(values);
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
                            <a href="" className="btn btn-block btn-social btn-facebook">
                                <span className="fa fa-facebook" aria-hidden="true"></span> Facebook
                            </a>

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
                            <SignUpForm onSubmit={this.onSignUpSubmit} />
                        </div>

                        <a href="#logIn"
                            id="LoginShower"
                            className="btn btn-warning btn-block"
                            data-toggle="collapse"
                            aria-expanded="False">
                            Log In
                        </a>
                        <div id="logIn" className="collapse">
                            <LoginForm onSubmit={this.onLoginSubmit} />
                        </div>
                        <button className="btn btn-warning btn-block btn-learn-more" >Learn More</button>
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

export default connect (null, {doAuthentication, login}) (AuthCard);
