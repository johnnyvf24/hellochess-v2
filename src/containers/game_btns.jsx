import React, {Component} from 'react';
import { connect } from 'react-redux';
import {resign} from '../actions/room';

class GameButtons extends Component {

    constructor (props) {
        super(props);

        this.onResign = this.onResign.bind(this);
    }

    userIsPlaying(userObj, roomObj) {
        if(roomObj.white && userObj._id === roomObj.white._id) {
            return true;
        }
        if(roomObj.black && userObj._id === roomObj.black._id) {
            return true;
        }
        if(roomObj.gold && userObj._id === roomObj.gold._id) {
            return true;
        }
        if(roomObj.red && userObj._id === roomObj.red._id) {
            return true;
        }

        return false;
    }

    onResign(event) {
        console.log('here');
        this.props.resign(this.props.profile._id, this.props.activeThread);
    }

    render() {
        const {activeThread, openThreads, profile} = this.props;

        if(!activeThread || !openThreads[activeThread]) {
            return <div>Loading...</div>
        }

        const {game} = openThreads[activeThread];

        if(!game) {
            return <div></div>
        }

        if(!this.userIsPlaying(profile, openThreads[activeThread])) {
            return <div></div>
        }
        return (
            <div className="row">
                <div className="center">
                    <div className="btn-group" role="group" aria-label="Basic example">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={this.onResign}>
                            Resign
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary">
                            Send Draw Request
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {

    return  {
        activeThread: state.activeThread,
        openThreads: state.openThreads,
        profile: state.auth.profile
    }

}

export default connect(mapStateToProps, {resign}) (GameButtons)
