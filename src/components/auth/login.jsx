import React, { Component } from 'react'
import AuthCard from '../../containers/auth_card';
import { login, logoutUser } from '../../actions/index'
import {Grid, Row, Col, Clearfix} from 'react-bootstrap';

export default class Login extends Component {
    render() {

        return (
            <Grid fluid={true}>
                <Row>
                    <Col xs={0} sm={0} md={4} />
                    <Col xs={12} md={4}>
                        <img className="img-responsive home-logo" src="https://www.hellochess.com/img/alpha_banner.png" alt="" />
                    </Col>
                    <Col xs={0} sm={0} md={4} />
                </Row>
                
                <AuthCard />
            </Grid>
        );
    }
}
