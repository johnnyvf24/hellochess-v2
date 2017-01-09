import React, {Component} from 'react';
import { Field, reduxForm } from 'redux-form';

class LoginForm extends Component {
    render() {
        const { handleSubmit } = this.props;
        return (
            <form id="loginForm"
                className="form-control"
                onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="loginEmail">Email</label>
                    <Field name="loginEmail"
                        component="input"
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="loginPassword">Password</label>
                    <Field name="loginPassword"
                        component="input"
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                    />
                </div>
                <button id="logInTrigger" className="btn btn-secondary"
                    type="submit">
                    Login
                </button>
            </form>
        );
    }
}

LoginForm = reduxForm({
    form: 'loginForm',
})(LoginForm)

export default LoginForm;
