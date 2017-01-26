import React, {Component} from 'react';
import {connect} from 'react-redux';
import {sitDownBoard} from '../../../actions/room';

class SitBlack extends Component {
    constructor(props) {
        super(props);
    }

    onSit(event) {
        let obj = {};
        obj.profile = this.props.profile;
        obj.roomName = this.props.activeThread;
        obj.color = 'b';
        this.props.sitDownBoard(obj);
    }

    render() {
        const {game} = this.props;
        let time = game.time;
        return (
            <div className="card player-card">
                <div className="card-block black-player">
                    <div className="row">
                        <button
                            className="btn btn-default"
                            onClick={this.onSit.bind(this)}>
                            Play Black
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
        activeThread: state.activeThread,
        game: state.openThreads[state.activeThread]
    }
}


export default connect(mapStateToProps,  {sitDownBoard}) (SitBlack)
