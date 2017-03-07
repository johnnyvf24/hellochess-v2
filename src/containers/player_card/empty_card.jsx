import React, {Component} from 'react';
import {connect} from 'react-redux';
import {sitDownBoard, sitDownComputer} from '../../actions/room';

class EmptyCard extends Component {
    constructor(props) {
        super(props);
    }

    onSit(event) {
        let obj = {};
        obj.profile = this.props.profile;
        obj.roomName = this.props.activeThread;
        obj.color = this.props.color;
        this.props.sitDownBoard(obj);
    }

    aiSit(event) {
        let obj = {};
        obj.roomName = this.props.activeThread;
        obj.profile = {
            type: 'computer',
            username: 'AI',
            picture: 'https://openclipart.org/image/75px/svg_to_png/168755/cartoon-robot.png&disposition=attachment',
            four_elos: {
                classic: 1200,
                rapid: 1200,
                blitz: 1200,
                bullet: 1200
            }
        }
        obj.color = this.props.color;
        this.props.sitDownComputer(obj);
    }
    
    renderAIButton() {
        const {game} = this.props;
        if (game.gameType === "two-player") {
            return (<div></div>);
        } else {
            return (
                <button type="button"
                    className="btn btn-default"
                    onClick={this.aiSit.bind(this)}>
                    <i className="fa fa-laptop" aria-hidden="true"></i>
                </button>
            );
        }
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
                                onClick={this.onSit.bind(this)}>
                                Play
                            </button>
                            {aiButton}
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