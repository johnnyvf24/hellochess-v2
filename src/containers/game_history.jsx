import React, {Component} from 'react';
import { connect } from 'react-redux';
import ExistingRoomList from './existing_room_list';
import Room from '../components/room/room';
import {mapObject} from '../utils/';
import {getRecentGames} from '../actions/user';
import {joinAnalysisRoom} from '../actions/index';

import {Panel, ListGroup, ListGroupItem, Col, Row, Popover, OverlayTrigger} from 'react-bootstrap';

class GameHistory extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.getRecentGames(this.props.profile._id);
    }

    onSelectTab(chatName, event) {

    }

    onCloseChatTab(chatName, event) {

    }
    
    onViewGame(game) {
        this.props.joinAnalysisRoom(game);
    }
    
    renderGame(game) {

        return (
            <ListGroupItem key={game._id} className="recent-games-list-group-item">
                <Row onClick={this.onViewGame.bind(this, game)}>
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
                        RECENT STANDARD GAMES
                    </strong>
                </h5>
                <ListGroup>
                    { this.props.recentGames.standard.map(this.renderGame.bind(this)) }
                </ListGroup>
                
                {/*-------------SChess------------------*/}
                <h5 className="ribbon-small">
                    <strong className="ribbon-content">
                        RECENT S-CHESS GAMES
                    </strong>
                </h5>
                <ListGroup>
                    { this.props.recentGames.schess.map(this.renderGame.bind(this)) }
                </ListGroup>
                
                {/*-------------Crazyhouse------------------*/}
                <h5 className="ribbon-small">
                    <strong className="ribbon-content">
                        RECENT CRAZYHOUSE GAMES
                    </strong>
                </h5>
                <ListGroup>
                    { this.props.recentGames.crazyhouse.map(this.renderGame.bind(this)) }
                </ListGroup>
                
                {/*-------------Crazyhouse960------------------*/}
                <h5 className="ribbon-small">
                    <strong className="ribbon-content">
                        RECENT CRAZYHOUSE960 GAMES
                    </strong>
                </h5>
                <ListGroup>
                    { this.props.recentGames.crazyhouse960.map(this.renderGame.bind(this)) }
                </ListGroup>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        connection: state.connection,
        activeThread: state.activeThread,
        openThreads: state.openThreads,
        profile: state.auth.profile,
        recentGames: state.recentGames
    };
}

export default connect(mapStateToProps, {getRecentGames}) (GameHistory);
