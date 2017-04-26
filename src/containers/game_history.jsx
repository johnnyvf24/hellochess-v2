import React, {Component} from 'react';
import { connect } from 'react-redux';
import ExistingRoomList from './existing_room_list';
import Room from '../components/room/room';
import {mapObject} from '../utils/';
import {getRecentGames} from '../actions/user';

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
    
    renderGame(game) {
        const popoverLeft = (
            <Popover id="popover-positioned-left" title="PGN">
                {game.pgn}
            </Popover>
        );
        return (
            <ListGroupItem key={game._id} className="recent-games-list-group-item">
                <OverlayTrigger trigger="click" placement="left" overlay={popoverLeft}>
                <Row>
                    <Col xs={5} className="game-result-white">
                        <img className="img-responsive img-circle picture-recent-games" src={game.white.user_id.picture} />
                        <div>
                            <strong>{game.white.user_id.username}</strong> {game.white.elo}
                        </div>
                    </Col>
                    <Col xs={2} classname="game-result-middle">
                    <span className="fa-stack fa-2x">
                        <i className="fa fa-shield fa-stack-2x" style={{color: "#f0ad4e"}} ></i>
                        <strong className="fa-stack-1x" style={{"font-size": "18px", "color": "#196880", "padding-right": "2px"}}>{game.result.replace("-", " ")}</strong>
                    </span>
                    </Col>
                    
                    <Col xs={5} className="game-result-black">
                        <img className="img-responsive img-circle picture-recent-games" src={game.black.user_id.picture} />
                        <div>
                            <strong>{game.black.user_id.username}</strong> {game.black.elo}
                        </div>
                    </Col>
                </Row>
                </OverlayTrigger>
            </ListGroupItem>
        );
    }
    
    render() {
        if(!this.props.profile || this.props.recentGames.length === 0) {
            return <div>
            </div>
        }

        return (
            <div>
                <h5 className="ribbon-small">
                    <strong className="ribbon-content">
                        YOUR RECENT STANDARD GAMES
                    </strong>
                </h5>

                    <ListGroup>
                        { this.props.recentGames.map(this.renderGame) }
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
