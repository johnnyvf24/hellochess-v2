import React, {Component} from 'react';
import { Field, reduxForm } from 'redux-form';

class SignUpForm extends Component {
    render() {
        const { handleSubmit } = this.props;
        return (
            <form id="signUpForm"
                className="form-control"
                onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="signUpEmail">Email</label>
                    <Field name="signUpEmail"
                        component="input"
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="signUpPassword">Password</label>
                    <Field name="signUpPassword"
                        component="input"
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                    />
                </div>
                <button className="btn btn-secondary"
                    type="submit">
                    Sign Up
                </button>
            </form>
        );
    }
}

SignUpForm = reduxForm({
    form: 'signUpForm',
})(SignUpForm)

export default SignUpForm;
