import React, {Component} from 'react';
import { Field, reduxForm } from 'redux-form';
import {FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';

class LoginForm extends Component {
    render() {
        const { handleSubmit } = this.props;
        return (
            <form id="loginForm"
                onSubmit={handleSubmit}>
                <FormGroup>
                    <ControlLabel htmlFor="loginEmail">Email</ControlLabel>
                    <Field name="loginEmail"
                        component="input"
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel htmlFor="loginPassword">Password</ControlLabel>
                    <Field name="loginPassword"
                        component="input"
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                    />
                </FormGroup>
                <Button type="submit"
                     bsStyle="primary"
                     id="logInTrigger">
                     Login
                </Button>
            </form>
        );
    }
}

LoginForm = reduxForm({
    form: 'loginForm',
})(LoginForm)

export default LoginForm;
