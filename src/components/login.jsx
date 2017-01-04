import React, { Component, PropTypes as T } from 'react'
import LoginCard from './login_card';
import { login, logoutUser } from '../actions/index'

export default class Login extends Component {
    render() {
        const { dispatch, isAuthenticated, errorMessage } = this.props;

        return (
            <div>
                <div className="row">
                    <div className="col-sm-hidden col-md-3 col-lg-4">
                    </div>
                    <div className="col-sm-12 col-md-6 col-lg-4">
                        <img className="img-fluid home-logo" src="https://www.hellochess.com/img/alpha_banner.png" alt="" />
                    </div>
                    <div className="col-sm-hidden col-md-3 col-lg-4">
                    </div>
                </div>
                <LoginCard
                    errorMessage= {errorMessage}
                    onLoginClick={() =>dispatch(login())}
                    />
            </div>
        );
    }
}

Login.T = {
    dispatch: T.func.isRequired,
    isAuthenticated: T.bool.isRequired,
    errorMessage: T.string
}
