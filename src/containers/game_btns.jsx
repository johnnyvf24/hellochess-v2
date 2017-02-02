import React, {Component} from 'react';
import { connect } from 'react-redux';

class GameButtons extends Component {

    constructor (props) {
        super(props);
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
                        <button type="button" className="btn btn-secondary">Resign</button>
                        <button type="button" className="btn btn-secondary">Send Draw Request</button>
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

export default connect(mapStateToProps) (GameButtons)
