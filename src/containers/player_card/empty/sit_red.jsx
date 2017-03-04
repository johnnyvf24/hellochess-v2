import React, {Component} from 'react';
import {connect} from 'react-redux';
import {sitDownBoard, sitDownComputer} from '../../../actions/room';

class SitRed extends Component {
    constructor(props) {
        super(props);
    }

    onSit(event) {
        let obj = {};
        obj.profile = this.props.profile;
        obj.roomName = this.props.activeThread;
        obj.color = 'r';
        this.props.sitDownBoard(obj);
    }

    aiSit(event) {
        let obj = {};
        obj.roomName = this.props.activeThread;
        obj.profile = {
            type: 'computer',
            username: 'AI',
            four_elos: {
                classic: 1100,
                rapid: 1100,
                blitz: 1100,
                bullet: 1100
            }
        }
        obj.color = 'r';
        this.props.sitDownComputer(obj);
    }

    render() {
        const {game} = this.props;
        let time = game.time;
        return (
            <div className="card player-card">
                <div className="card-block red-player">
                    <div className="row">
                        <div className="btn-group">
                            <button
                                className="btn btn-info"
                                onClick={this.onSit.bind(this)}>
                                Play
                            </button>
                            <button type="button"
                                className="btn btn-default"
                                onClick={this.aiSit.bind(this)}>
                                <i className="fa fa-laptop" aria-hidden="true"></i>
                            </button>
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

export default connect(mapStateToProps,  {sitDownBoard, sitDownComputer}) (SitRed)
