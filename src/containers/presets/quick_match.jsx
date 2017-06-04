import React, {Component} from 'react';
import {connect} from 'react-redux';

import {startPairing, stopPairing} from '../../actions/create_game';

import Loading from 'react-loading-animation';
import Select from 'react-select';
import {Row, Col, Button} from 'react-bootstrap';


const gameTypeOptions = [
    { value: 'standard', label: 'Standard'},
    // { value: 'four-player', label: 'Four Player'},
    { value: 'schess', label: 'S-Chess'},
    { value: 'crazyhouse', label: 'Crazyhouse'},
    { value: 'crazyhouse960', label: 'Crazyhouse 960'},
    // { value: 'four-player-team', label: 'Four Player Teams'}
];

class QuickMatch extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            gameType: 'standard',
        }
    }
    
    startPairing(timeControl, increment) {
        this.props.startPairing(this.state.gameType, timeControl, increment);
    }
    
    stopPairing() {
        this.props.stopPairing();
    }
    
    onSelectGameType(val) {
        this.setState({
            gameType: val.value, 
        });
    }
    
    render() {
        return (
            <div className="text-center">
                <h1 className="ribbon">
                    <strong className="ribbon-content">
                        PAIR ME
                    </strong>
                </h1>
                <Row>
                    <Col xs={4}/>
                    <Col xs={4} >
                        <Select
                            name="game-type"
                            value={this.state.gameType}
                            options={gameTypeOptions}
                            onChange={this.onSelectGameType.bind(this)}
                        />
                    </Col>
                    <Col xs={4}/>
                </Row>
                <Row className="btn-preset-row">
                    <Col xs={4}>
                        <Button onClick={(e) =>this.startPairing(1, 0)} bsSize="large" block>1 min</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={(e) =>this.startPairing(2, 0)} bsSize="large" block>2 min</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={(e) =>this.startPairing(3, 0)} bsSize="large" block>3 min</Button>
                    </Col>
                </Row>
                
                <Row className="btn-preset-row">
                    
                    <Col xs={4}>
                        <Button onClick={(e) =>this.startPairing(5, 0)} bsSize="large" block>5 min</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={(e) =>this.startPairing(10, 0)} bsSize="large" block>10 min</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={(e) =>this.startPairing(1, 1)} bsSize="large" block>1 | 1 </Button>
                    </Col>
                </Row>
                    
                <Row className="btn-preset-row">
                    <Col xs={4}>
                        <Button onClick={(e) =>this.startPairing(2, 1)} bsSize="large" block>2 | 1</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={(e) =>this.startPairing(3, 1)} bsSize="large" block>3 | 1</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={(e) =>this.startPairing(10, 15)} bsSize="large" block>10 | 15</Button>
                    </Col>
                </Row>
                
                <Row className="text-center match-searching-row">
                    {this.props.searching && (
                        <div>
                            <h3 style={{color: 'white'}}>Looking for a {this.props.timeControl}+{this.props.increment} {this.props.gameType} game</h3>
                            <Loading />
                            <Button onClick={this.stopPairing.bind(this)} className="cancel-pairing-btn" bsStyle="danger">
                                cancel
                            </Button>
                        </div>
                    )}
                </Row>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        searching: state.matchmaking.searching,
        timeControl: state.matchmaking.timeControl,
        increment: state.matchmaking.increment,
        gameType: state.matchmaking.gameType
    };
}

export default connect(mapStateToProps, {startPairing, stopPairing}) (QuickMatch);