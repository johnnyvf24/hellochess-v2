import React, {Component} from 'react';
import {connect} from 'react-redux';
import {sitDownBoard} from '../../actions/room';

class SitGold extends Component {
    constructor(props) {
        super(props);
    }

    onSit(event) {
        let obj = {};
        obj.profile = this.props.profile;
        obj.roomName = this.props.activeThread;
        obj.color = 'g';
        this.props.sitDownBoard(obj);
    }

    render() {
        const {time} = this.props;
        return (
            <div className="card player-card">
                <div className="card-block gold-player">
                    <div className="row">
                        <button className="btn btn-default"
                            onClick={this.onSit.bind(this)}>
                            Play Gold
                        </button>
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
        activeThread: state.activeThread
    }
}


export default connect(mapStateToProps,  {sitDownBoard}) (SitGold)
