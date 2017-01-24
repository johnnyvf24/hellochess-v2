import React, {Component} from 'react';
import {connect} from 'react-redux';

class SitBlack extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {time} = this.props;
        return (
            <div className="card player-card">
                <div className="card-block black-player">
                    <div className="row">
                        <button className="btn btn-default">
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
        profile: state.auth.profile
    }
}


export default connect(mapStateToProps,  {}) (SitBlack)
