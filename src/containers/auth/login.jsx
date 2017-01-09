import React, { Component } from 'react'
import AuthCard from './auth_card';
import { login, logoutUser } from '../../actions/index'

export default class Login extends Component {
    render() {

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
                <AuthCard />
            </div>
        );
    }
}
