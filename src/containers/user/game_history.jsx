import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Room from '../../components/room/room';
import {mapObject} from '../../utils/';
import {getRecentGames} from '../../actions/user';
import {joinAnalysisRoom} from '../../actions/room';
import {selectedRoom} from '../../actions/index';

import {PanelGroup, Panel, ListGroup, ListGroupItem, Col, Row, Popover, OverlayTrigger} from 'react-bootstrap';

class GameHistory extends Component {

    constructor(props) {
        super(props);
        this.onViewGame = this.onViewGame.bind(this);
        this.renderGame = this.renderGame.bind(this);
    }

    componentWillMount() {
        this.props.getRecentGames(this.props.profile._id);
    }

    onSelectTab(chatName, event) {

    }

    onCloseChatTab(chatName, event) {

    }
    
    onViewGame(game, gameType) {
        let roomName = gameType + game._id.slice(0, 5);
        this.props.joinAnalysisRoom(game, gameType, roomName);
        this.props.selectedRoom(roomName);
        browserHistory.push('/live');
    }
    
    renderFourGame(game, gameType) {
        return (
            <ListGroupItem key={game._id} className="recent-games-list-group-item">
                <Row onClick={(e) => {this.onViewGame(game, gameType)}}>
                    <Col xs={12} className="game-result-white">
                        {game.white.user_id.username}[{game.white.elo}] vs {game.black.user_id.username}[{game.black.elo}] vs {game.gold.user_id.username}[{game.gold.elo}] vs {game.red.user_id.username}[{game.red.elo}] 
                    </Col>
                </Row>
            </ListGroupItem>
        );
    }
    
    renderGame(game, gameType) {
        return (
            <ListGroupItem key={game._id} className="recent-games-list-group-item">
                <Row onClick={(e) => {this.onViewGame(game, gameType)}}>
                    <Col xs={5} className="game-result-white">
                        <img className="img-responsive img-circle picture-recent-games" src={game.white.user_id.picture} />
                        <div>
                            <strong>{game.white.user_id.username}</strong> {game.white.elo}
                        </div>
                    </Col>
                    <Col xs={2} className="game-result-middle">
                    <span className="fa-stack fa-2x">
                        <i className="fa fa-shield fa-stack-2x" style={{color: "#f0ad4e"}} ></i>
                        <strong className="fa-stack-1x" style={{"fontSize": "18px", "color": "#196880", "paddingRight": "2px"}}>{game.result.replace("-", " ")}</strong>
                    </span>
                    </Col>
                    
                    <Col xs={5} className="game-result-black">
                        <img className="img-responsive img-circle picture-recent-games" src={game.black.user_id.picture} />
                        <div>
                            <strong>{game.black.user_id.username}</strong> {game.black.elo}
                        </div>
                    </Col>
                </Row>
            </ListGroupItem>
        );
    }
    
    render() {
        let room = this.props.openThreads[this.props.activeThread];
        if(!this.props.profile || !this.props.recentGames.standard 
            || !this.props.recentGames.schess || !this.props.recentGames.crazyhouse
            || !this.props.recentGames.crazyhouse960) {
            return <div>
            </div>
        }
        
        return (
            <div>
                {/*-------------STANDARD------------------*/}
                <h5 className="ribbon-small">
                    <strong className="ribbon-content">
                       {this.props.profile.username}'s RECENT GAMES
                    </strong>
                </h5>
                <PanelGroup accordion>
                    <Panel bsStyle="info" header="Standard" eventKey="1">
                        <ListGroup>
                            { this.props.recentGames.standard.map( (g) => this.renderGame(g, 'standard')) }
                        </ListGroup>
                    </Panel>
                    <Panel bsStyle="info" header="Four player chess" eventKey="4">
                        <ListGroup>
                            { this.props.recentGames.four_player.map( (g) => this.renderFourGame(g, 'four-player')) }
                        </ListGroup>
                    </Panel>
                    <Panel bsStyle="info" header="S-Chess" eventKey="2">
                        <ListGroup>
                            { this.props.recentGames.schess.map( (g) => this.renderGame(g, 'schess')) }
                        </ListGroup>
                    </Panel>
                    <Panel bsStyle="info" header="Crazyhouse" eventKey="3">
                        <ListGroup>
                            { this.props.recentGames.crazyhouse.map( (g) => this.renderGame(g, 'crazyhouse')) }
                        </ListGroup>
                    </Panel>
                    <Panel bsStyle="info" header="Crazyhouse 960" eventKey="4">
                        <ListGroup>
                            { this.props.recentGames.crazyhouse960.map( (g) => this.renderGame(g, 'crazyhouse960')) }
                        </ListGroup>
                    </Panel>
                </PanelGroup>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        connection: state.connection,
        activeThread: state.activeThread,
        openThreads: state.openThreads,
        recentGames: state.recentGames,
    };
}

export default connect(mapStateToProps, {getRecentGames, joinAnalysisRoom, selectedRoom}) (GameHistory);
