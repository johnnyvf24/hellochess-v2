import React, {Component} from 'react';
import { Field, reduxForm } from 'redux-form';
import {FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';

const email = value =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ?
    'Invalid email address' : undefined

class SignUpForm extends Component {


    renderField ({ input, label, placeholder, type, meta: { touched, error, warning } }) {

        return (
            <div className={touched && error ? "form-group has-danger": "form-group"}>
                <label className="form-control-label">{label}</label>
                <input className={(touched && error) ? "form-control has-danger" : "form-control"} {...input} placeholder={placeholder} type={type} />
                {touched && (error && <div className="form-error">{error}</div>)}

            </div>
        )
    }

    render() {
        const { handleSubmit } = this.props;
        return (
            <form id="signUpForm"
                onSubmit={handleSubmit}>
                <Field name="signUpEmail"
                    component={this.renderField}
                    type="email"
                    placeholder="Enter email"
                    label="Email"
                />

                <Field name="signUpPassword"
                    component={this.renderField}
                    type="password"
                    placeholder="Enter password"
                    label="Password"
                />

                <Field name="vSignUpPassword"
                    component={this.renderField}
                    type="password"
                    placeholder="Reenter password"
                    label="Verify Password"
                />

                <Button type="submit"
                     bsStyle="primary">
                     Sign Up
                </Button>
            </form>
        );
    }
}

//Validate the form
const validate = (values) => {
    const errors = {};

    if(values.signUpPassword !== values.vSignUpPassword) {
        errors.signUpPassword = 'Passwords do not match!'
    }

    if(!values.signUpPassword) {
        errors.signUpPassword = "Please enter a password";
    }

    if(!values.signUpEmail) {
        errors.signUpEmail = " Please enter an email";
    }

    if(!values.vSignUpPassword) {
        errors.vSignUpPassword = "Please enter a password confirmation";
    }

    return errors;
}

SignUpForm = reduxForm({
    form: 'signUpForm',
    validate
})(SignUpForm)

export default SignUpForm;
