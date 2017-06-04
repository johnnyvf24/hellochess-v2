import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { mapObject } from '../../utils';

import { getPlayerList } from '../../actions/user';
import {Panel, Button, Thumbnail, Col, Row, Grid} from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';


class PlayerList extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.getPlayerList(0);
    }
    
    loadMore(i) {
        this.props.getPlayerList(i);
    }

    back(e) {
        e.preventDefault();
        browserHistory.push('/live');
    }
    
    renderPlayer(player) {
        return (
            <Col key={player._id} xs={6} md={4} lg={3} className="text-center">
                <div className="thumbnail">
                    <img src={player.picture} style={{width: 200, height: 200,}} alt="..." />
                    <div className="caption">
                        <h3>{player.username ? player.username : "unknown"}</h3>
                        <p>...</p>
                        <p>
                            <Button 
                                bsStyle="primary"
                                onClick={(e) => browserHistory.push(`/profile/${player._id}`)}>
                                View Profile
                            </Button>
                        </p>
                    </div>
                </div>
            </Col>
        );
    }

    render() {
        let { playerList, hasMore } = this.props;
        if(!playerList) {
            return (
                <Row>
                    <a href="#"
                        className="btn btn-warning"
                        onClick={this.back.bind(this)}>
                        <i className="fa fa-chevron-left fa-2x" aria-hidden="true"></i>
                    </a>
                </Row>
            );
        } else {
            return (
                <div>
                    <a href="#"
                        className="btn btn-warning"
                        onClick={this.back.bind(this)}>
                        <i className="fa fa-chevron-left fa-2x" aria-hidden="true"></i>
                    </a>
                    <Grid>
                        <Row>
                            <div className="text-center">
                                <h1 className="ribbon">
                                    <strong className="ribbon-content">
                                        PLAYERS
                                    </strong>
                                </h1>
                            </div>
                            <InfiniteScroll
                                pageStart={playerList.length ? playerList.length/24 : 0}
                                hasMore={hasMore}
                                loadMore={this.loadMore.bind(this)}
                                loader={<div className="loader">Loading ...</div>}
                            >
                            { this.props.playerList.map(this.renderPlayer.bind(this)) }
                            </InfiniteScroll>
                        </Row>
                    </Grid>
                </div>
            );
        }

    }
}
function mapStateToProps(state) {
    return {
        playerList: state.playerList.players,
        hasMore: state.playerList.hasMore,
    }
}

export default connect (mapStateToProps, {getPlayerList}) (PlayerList);
