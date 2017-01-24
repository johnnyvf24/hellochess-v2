import React, {Component} from 'react';
import {connect} from 'react-redux';
import {sitDownBoard1} from '../../actions/room';

class SitWhite extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {time} = this.props;
        return (
            <div className="card player-card">
                <div className="card-block">
                    <div className="row">
                        <button className="btn btn-default">
                            Play White
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


export default connect(mapStateToProps,  {}) (SitWhite)
