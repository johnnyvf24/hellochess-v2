import React, {Component} from 'react';
import { Field, reduxForm } from 'redux-form';
import {FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap';

class LoginForm extends Component {
    
    render() {
        const { handleSubmit } = this.props;
        return (
            <form id="loginForm"
                onSubmit={handleSubmit}>
                <FormGroup bsSize="large">
                    <ControlLabel htmlFor="loginEmail">Email</ControlLabel>
                    <Field name="loginEmail"
                        component="input"
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                    />
                </FormGroup>
                <FormGroup bsSize="large">
                    <ControlLabel htmlFor="loginPassword">Password</ControlLabel>
                    <Field name="loginPassword"
                        component="input"
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                    />
                </FormGroup>
                <Button block type="submit"
                     bsStyle="warning"
                     bsSize="large"
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
