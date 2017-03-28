import React, {Component} from 'react';
import {connect} from 'react-redux';
import {sitDownBoard, sitDownComputer} from '../../actions/room';

class EmptyCard extends Component {
    constructor(props) {
        super(props);
        this.aiSit = this.aiSit.bind(this);
        this.onSit = this.onSit.bind(this);
        this.difficulties = {
            1: "Very Easy",
            5: "Easy",
            10: "Normal",
            15: "Hard",
            20: "Very Hard"
        };
    }
    
    onSit(event) {
        let obj = {};
        obj.profile = this.props.profile;
        obj.roomName = this.props.activeThread;
        obj.color = this.props.color;
        this.props.sitDownBoard(obj);
    }

    aiSit(event) {
        let level = arguments[0];
        let difficultyText = this.difficulties[level];
        let obj = {};
        obj.roomName = this.props.activeThread;
        let elos;
        if (this.props.game.gameType === "two-player" ||
            this.props.game.gameType === "crazyhouse" ||
            this.props.game.gameType === "crazyhouse960")
            elos = "two_elos";
        else if (this.props.game.gameType === "four-player")
            elos = "four_elos";
        obj.profile = {
            type: 'computer',
            username: difficultyText + ' AI',
            level: level,
            picture: 'https://openclipart.org/image/75px/svg_to_png/168755/cartoon-robot.png&disposition=attachment',
        };
        obj.profile[elos] = {
            classic: 1200,
            rapid: 1200,
            blitz: 1200,
            bullet: 1200
        };
        obj.color = this.props.color;
        this.props.sitDownComputer(obj);
    }
    
    renderAIButton() {
        return (
            <div className="btn-group">
              <button type="button"
                className="btn btn-default btn-sm dropdown-toggle"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                    <i className="fa fa-laptop" aria-hidden="true"></i>
                    <span className="caret"></span>
                    <span className="sr-only">AI Difficulty</span>
              </button>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#" onClick={this.aiSit.bind(this, 1)}>Very Easy</a></li>
                <li><a className="dropdown-item" href="#" onClick={this.aiSit.bind(this, 5)}>Easy</a></li>
                <li><a className="dropdown-item" href="#" onClick={this.aiSit.bind(this, 10)}>Normal</a></li>
                <li><a className="dropdown-item" href="#" onClick={this.aiSit.bind(this, 15)}>Hard</a></li>
                <li><a className="dropdown-item" href="#" onClick={this.aiSit.bind(this, 20)}>Very Hard</a></li>
              </ul>
            </div>
        );
    }

    render() {
        const {game} = this.props;
        let time = game.time;
        let aiButton = this.renderAIButton();
        return (
            <div className="card player-card">
                <div className={"card-block " + this.props.colorClass}>
                    <div className="row">
                        <div className="btn-group">
                            <button
                                className="btn btn-info"
                                onClick={this.onSit}>
                                Play
                            </button>
                            {/*aiButton*/}
                        </div>
                    </div>

                    <h4 className="card-title pull-right">{`${time.value}:00`}</h4>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.auth.profile,
        activeThread: state.activeThread,
        game: state.openThreads[state.activeThread]
    }
}


export default connect(mapStateToProps,  {sitDownBoard, sitDownComputer}) (EmptyCard)