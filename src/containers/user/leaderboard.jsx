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
                <Col xs={4}>
                    <div className="pull-left">
                        <h5 className="leaderboard-position">{(parseInt(index) + 1)}</h5>
                    </div>
                    <img className="img-responsive img-circle leaderboard-pic" src={user.picture} />
                </Col>
                <Col xs={4}>
                    <h5>
                        {user.username}
                    </h5>
                </Col>
                
                <Col xs={4}>
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
                        className="btn"
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
                                    <Tabs active={1}>
                                        <Tab eventKey={1} title="Four player">
                                            <div className="row leaderboard-box">
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Bullet">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.fourplayerBullet, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'fourplayer_ratings', 'bullet');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Blitz">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.fourplayerBlitz, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'fourplayer_ratings', 'blitz');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Rapid">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.fourplayerRapid, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'fourplayer_ratings', 'rapid');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Classical">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.fourplayerClassical, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'fourplayer_ratings', 'classic');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={2} title="Standard">
                                            <div className="row leaderboard-box">
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Bullet">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.standardBullet, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'standard_ratings', 'bullet');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Blitz">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.standardBlitz, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'standard_ratings', 'blitz');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Rapid">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.standardRapid, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'standard_ratings', 'rapid');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Classical">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.standardClassical, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'standard_ratings', 'classic');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={3} title="Crazyhouse">
                                            <div className="row leaderboard-box">
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Bullet">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zhBullet, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse_ratings', 'bullet');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Blitz">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zhBlitz, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse_ratings', 'blitz');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Rapid">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zhRapid, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse_ratings', 'rapid');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Classical">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zhClassical, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse_ratings', 'classic');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={4} title="Crazyhouse 960">
                                            <div className="row leaderboard-box">
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Bullet">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zh960Bullet, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse960_ratings', 'bullet');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Blitz">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zh960Blitz, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse960_ratings', 'blitz');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Rapid">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zh960Rapid, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse960_ratings', 'rapid');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
                                                <div className="col-xs-3">
                                                    <Panel bsStyle="info" header="Classical">
                                                        <ListGroup>
                                                            {mapObject(
                                                                leaderboard.zh960Classical, function (index, user) {
                                                                    return this.renderLeaderBoardList(index, user, 'crazyhouse960_ratings', 'classic');
                                                                }.bind(this)
                                                            )}
                                                        </ListGroup>
                                                    </Panel>
                                                </div>
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
