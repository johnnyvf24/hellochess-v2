import React, { Component, PropTypes as T } from 'react';
import { connect, bindActionCreators } from 'react-redux';
import { login, doAuthentication } from '../actions/index'

class LoginCard extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.props.doAuthentication();
    }

    onClick(event) {
        this.props.onLoginClick();
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
                        <button className="btn btn-warning btn-block btn-signin" onClick = {this.onClick} type="submit">Login/Make An Account!</button>
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

LoginCard.T = {
  onLoginClick: T.func.isRequired,
  errorMessage: T.string
}

export default connect (null, {doAuthentication, login}) (LoginCard);
