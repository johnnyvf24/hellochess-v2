import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { mapObject } from '../../utils';

import { getLeaderboard } from '../../actions/user';
import {Panel, Button, ListGroup, ListGroupItem, Col, Row, Tabs, Tab, Grid} from 'react-bootstrap'

class Leaderboard extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let user_id = this.props.params.id;
        this.props.getLeaderboard(user_id);
    }

    back(e) {
        e.preventDefault();
        browserHistory.push('/live');
    }
    
    renderLeaderBoardList(index, user, eloCategory, eloType) {
        return (
            <ListGroupItem className="leaderboard-listgroup-item" key={user._id}>
                <Row>
                    <Col xs={3}>
                        <img className="img-responsive img-circle leaderboard-pic" src={user.picture} />
    
                    </Col>
                    <Col xs={4}>
                        <h5 className="leaderboard-username">
                            {user.username}
                        </h5>
                    </Col>
                    
                    <Col xs={3}>
                        <div className="pull-right">
                            <h5>{user[eloCategory][eloType]}</h5>
                        </div>
                    </Col>  
                </Row>
            </ListGroupItem>
        );
    }

    render() {
        let { leaderboard } = this.props;
        if(!leaderboard.fourplayerBullet ) {
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
                    <div className="row">
                        <a href="#"
                            className="btn btn-warning"
                            onClick={this.back.bind(this)}>
                            <i className="fa fa-chevron-left fa-2x" aria-hidden="true"></i>
                        </a>
                    </div>
                    <Grid fluid={true}>
                        <Row>
                            
                            <h1 className="ribbon">
                                <strong className="ribbon-content">
                                    LEADERBOARD
                                </strong>
                            </h1>
                        </Row>
                        <Row>
                        <Col xs={1} />
                            <Col xs={10}>
                                <Panel className="leaderboard-container">
                                    <Tabs id="leaderboard-tabs">
                                        <Tab eventKey={1} title="Four player">
                                            <div className="row leaderboard-box">
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Bullet (0 - 4 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.fourplayerBullet, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'fourplayer_ratings', 'bullet');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Blitz (4 - 12 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.fourplayerBlitz, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'fourplayer_ratings', 'blitz');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Rapid (12 -  20 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.fourplayerRapid, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'fourplayer_ratings', 'rapid');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Classical ( 20 mins +]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.fourplayerClassical, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'fourplayer_ratings', 'classic');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={2} title="Standard">
                                            <div className="row leaderboard-box">
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Bullet (0 - 2 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.standardBullet, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'standard_ratings', 'bullet');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Blitz (2 - 8 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.standardBlitz, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'standard_ratings', 'blitz');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Rapid (2 - 15 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.standardRapid, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'standard_ratings', 'rapid');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Classical (15 mins +]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.standardClassical, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'standard_ratings', 'classic');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={3} title="Crazyhouse">
                                            <div className="row leaderboard-box">
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Bullet (0 - 2 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zhBullet, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse_ratings', 'bullet');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Blitz (2 - 8 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zhBlitz, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse_ratings', 'blitz');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Rapid (2 - 15 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zhRapid, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse_ratings', 'rapid');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Classical (15 mins +]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zhClassical, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse_ratings', 'classic');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={4} title="Crazyhouse 960">
                                            <div className="row leaderboard-box">
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Bullet (0 - 2 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zh960Bullet, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse960_ratings', 'bullet');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Blitz (2 - 8 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zh960Blitz, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse960_ratings', 'blitz');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Rapid (2 - 15 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zh960Rapid, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse960_ratings', 'rapid');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Classical (15 mins +]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zh960Classical, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse960_ratings', 'classic');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={5} title="S-Chess (Seirawan Chess)">
                                            <div className="row leaderboard-box">
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Bullet (0 - 2 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.schessBullet, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'schess_ratings', 'bullet');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Blitz (2 - 8 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.schessBlitz, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'schess_ratings', 'blitz');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Rapid (2 - 15 mins]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.schessRapid, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'schess_ratings', 'rapid');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                                <Col xs={12} sm={6} md={3}>
                                                    <Panel bsStyle="info" header="Classical (15 mins +]">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.schessClassical, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'schess_ratings', 'classic');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </Col>
                                            </div>
                                        </Tab>
                                    </Tabs>
                                </Panel>
                            </Col>
                            <Col xs={1} />
                        </Row>
                    </Grid>
                </div>
            );
        }

    }
}
function mapStateToProps(state) {
    return {
        leaderboard: state.leaderboard,
    }
}

export default connect (mapStateToProps, {getLeaderboard}) (Leaderboard);
