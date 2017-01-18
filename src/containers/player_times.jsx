import React, {Component} from 'react';
import {connect} from 'react-redux';

class PlayerTimes extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className="col-xs-12">
                    <div className="card player-card">
                        <div className="card-block">

                            <div className="row">
                                <img className="rounded-circle" src={this.props.profile.picture} />
                                <div className="card-text"><h5>{this.props.profile.username}</h5>1245</div>
                            </div>

                            <h4 className="card-title pull-right">2:56</h4>
                        </div>
                    </div>
                </div>

                <div className="col-xs-12">
                    <div className="card player-card">
                        <div className="card-block black-player">

                            <div className="row">
                                <img className="rounded-circle" src={this.props.profile.picture} />
                                <div className="card-text"><h5>{this.props.profile.username}</h5>1245</div>
                            </div>

                            <h4 className="card-title pull-right">2:56</h4>
                        </div>
                    </div>
                </div>

                <div className="col-xs-12">
                    <div className="card player-card">
                        <div className="card-block gold-player">

                            <div className="row">
                                <img className="rounded-circle" src={this.props.profile.picture} />
                                <div className="card-text"><h5>{this.props.profile.username}</h5>1245</div>
                            </div>

                            <h4 className="card-title pull-right">2:56</h4>
                        </div>
                    </div>
                </div>

                <div className="col-xs-12">
                    <div className="card player-card">
                        <div className="card-block red-player">

                            <div className="row">
                                <img className="rounded-circle" src={this.props.profile.picture} />
                                <div className="card-text"><h5>{this.props.profile.username}</h5>1245</div>
                            </div>

                            <h4 className="card-title pull-right">2:56</h4>
                        </div>
                    </div>
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

export default connect(mapStateToProps) (PlayerTimes)
