import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { getUserProfile, clearRecentGames, clearCurrentProfile } from '../../actions/user';
import { Panel, Button, Row, Col, Nav, NavItem, Tab } from 'react-bootstrap'
import GameHistory from './game_history';

class Profile extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let user_id = this.props.params.id;
        this.props.getUserProfile(user_id);
    }
    
    componentWillUnmount() {
        this.props.clearRecentGames();
        this.props.clearCurrentProfile();
    }

    back(e) {
        e.preventDefault();
        browserHistory.push('/live');
    }

    render() {
        if(!this.props.profile.fourplayer_ratings) {
            return (
                <div className="row">
                    <a href="#"
                        className="btn btn-warning"
                        onClick={this.back.bind(this)}>
                        <i className="fa fa-chevron-left fa-2x" aria-hidden="true"></i>
                    </a>
                </div>
            );
        } else {
            return (
                <div>
                    <Row>
                        <a href="#"
                            className="btn btn-warning"
                            onClick={this.back.bind(this)}>
                            <i className="fa fa-chevron-left fa-2x" aria-hidden="true"></i>
                        </a>
                    </Row>
                    <Row>
                        <h1 className="profile-heading text-center">{this.props.profile.username}</h1>
                    </Row>
                    <Row>
                        <div className="col-xs-5">
                        </div>
                        <div className="col-xs-2 text-center">
                            <img className="img-thumbnail rounded img-fluid lg-profile-pic" src={this.props.profile.picture} />
                        </div>
                        <div className="col-xs-5">
                        </div>
                    </Row>
                    <Row>
                        <Col xs={2}>
                        </Col>
                        <Col xs={8}>
                            <Tab.Container id="profile-tabs-container" defaultActiveKey="first">
                                <Row className="clearfix">
                                    <Col sm={4}>
                                        <div id="profile-tabs-panel">
                                            <Nav bsStyle="pills" stacked>
                                                <NavItem eventKey="first">
                                                    Saved Games
                                                </NavItem>
                                                <NavItem eventKey="second">
                                                    Ratings
                                                </NavItem>
                                            </Nav>
                                        </div>
                                    </Col>
                                    <Col sm={8}>
                                        <Tab.Content animation>
                                            
                                            <Tab.Pane eventKey="first">
                                                <GameHistory profile={this.props.profile}/>
                                            </Tab.Pane>
                                            
                                            <Tab.Pane eventKey="second">
                                                <Panel className="rating-card text-center">
                                                    <div className="card-block">
                                                        <table className="table">
                                                          <thead className="thead-inverse">
                                                            <tr>
                                                              <th>Game Type</th>
                                                              <th>bullet</th>
                                                              <th>blitz</th>
                                                              <th>rapid</th>
                                                              <th>classic</th>
                                                            </tr>
                                                          </thead>
                                                          <tbody>
                                                            <tr>
                                                              <th scope="row">Four-Player Chess</th>
                                                              <td>{this.props.profile.fourplayer_ratings.bullet}</td>
                                                              <td>{this.props.profile.fourplayer_ratings.blitz}</td>
                                                              <td>{this.props.profile.fourplayer_ratings.rapid}</td>
                                                              <td>{this.props.profile.fourplayer_ratings.classic}</td>
                                                            </tr>
                                                            <tr>
                                                              <th scope="row">Standard Chess</th>
                                                              <td>{this.props.profile.standard_ratings.bullet}</td>
                                                              <td>{this.props.profile.standard_ratings.blitz}</td>
                                                              <td>{this.props.profile.standard_ratings.rapid}</td>
                                                              <td>{this.props.profile.standard_ratings.classic}</td>
                                                            </tr>
                                                            <tr>
                                                              <th scope="row">Crazyhouse</th>
                                                              <td>{this.props.profile.crazyhouse_ratings.bullet}</td>
                                                              <td>{this.props.profile.crazyhouse_ratings.blitz}</td>
                                                              <td>{this.props.profile.crazyhouse_ratings.rapid}</td>
                                                              <td>{this.props.profile.crazyhouse_ratings.classic}</td>
                                                            </tr>
                                                            <tr>
                                                              <th scope="row">Crazyhouse 960</th>
                                                              <td>{this.props.profile.crazyhouse960_ratings.bullet}</td>
                                                              <td>{this.props.profile.crazyhouse960_ratings.blitz}</td>
                                                              <td>{this.props.profile.crazyhouse960_ratings.rapid}</td>
                                                              <td>{this.props.profile.crazyhouse960_ratings.classic}</td>
                                                            </tr>
                                                            <tr>
                                                              <th scope="row">S-Chess</th>
                                                              <td>{this.props.profile.schess_ratings.bullet}</td>
                                                              <td>{this.props.profile.schess_ratings.blitz}</td>
                                                              <td>{this.props.profile.schess_ratings.rapid}</td>
                                                              <td>{this.props.profile.schess_ratings.classic}</td>
                                                            </tr>
                                                          </tbody>
                                                        </table>
                    
                                                    </div>
                                                </Panel>
                                            </Tab.Pane>
                                            
                                        </Tab.Content>
                                    </Col>
                                </Row>
                            </Tab.Container>
                        </Col>
                        <Col xs={2}>
                        </Col>
                    </Row>
                </div>
            );
        }

    }
}
function mapStateToProps(state) {
    return {
        profile: state.currentProfile,
    }
}

export default connect (mapStateToProps, {getUserProfile, clearRecentGames, clearCurrentProfile}) (Profile);
