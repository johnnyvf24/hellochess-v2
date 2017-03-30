import React, {Component} from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { getUserProfile } from '../../actions/user';

class Profile extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let user_id = this.props.params.id;
        this.props.getUserProfile(user_id);
    }

    back(e) {
        e.preventDefault();
        browserHistory.push('/live');
    }

    render() {
        if(!this.props.profile.fourplayer_ratings) {
            return (
                <div className="row">
                    <a href="#"
                        className="btn btn-secondary"
                        onClick={this.back.bind(this)}>
                        <i className="fa fa-chevron-left fa-2x" aria-hidden="true"></i>
                    </a>
                </div>
            );
        } else {
            console.log(this.props.profile);
            return (
                <div>
                    <div className="row">
                        <a href="#"
                            className="btn btn-secondary"
                            onClick={this.back.bind(this)}>
                            <i className="fa fa-chevron-left fa-2x" aria-hidden="true"></i>
                        </a>
                    </div>
                    <div className="row">
                        <h1 className="profile-heading center">{this.props.profile.username}</h1>
                    </div>
                    <div className="row">
                        <div className="col-xs-5">
                        </div>
                        <div className="col-xs-2 text-center">
                            <img className="img-thumbnail rounded img-fluid lg-profile-pic" src={this.props.profile.picture} />
                        </div>
                        <div className="col-xs-5">
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-3">
                        </div>
                        <div className="col-xs-6">

                            <div className="card rating-card text-center">
                                <div className="card-block">
                                    <h3 className="card-title">Ratings</h3>
                                    <table className="table">
                                      <thead className="thead-inverse">
                                        <tr>
                                          <th>Game Type</th>
                                          <th>bullet</th>
                                          <th>blitz</th>
                                          <th>rapid</th>
                                          <th>classic</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <th scope="row">Four-Player Chess</th>
                                          <td>{this.props.profile.fourplayer_ratings.bullet}</td>
                                          <td>{this.props.profile.fourplayer_ratings.blitz}</td>
                                          <td>{this.props.profile.fourplayer_ratings.rapid}</td>
                                          <td>{this.props.profile.fourplayer_ratings.classic}</td>
                                        </tr>
                                        <tr>
                                          <th scope="row">Standard Chess</th>
                                          <td>{this.props.profile.standard_ratings.bullet}</td>
                                          <td>{this.props.profile.standard_ratings.blitz}</td>
                                          <td>{this.props.profile.standard_ratings.rapid}</td>
                                          <td>{this.props.profile.standard_ratings.classic}</td>
                                        </tr>
                                        <tr>
                                          <th scope="row">Crazyhouse</th>
                                          <td>{this.props.profile.crazyhouse_ratings.bullet}</td>
                                          <td>{this.props.profile.crazyhouse_ratings.blitz}</td>
                                          <td>{this.props.profile.crazyhouse_ratings.rapid}</td>
                                          <td>{this.props.profile.crazyhouse_ratings.classic}</td>
                                        </tr>
                                        <tr>
                                          <th scope="row">Crazyhouse 960</th>
                                          <td>{this.props.profile.crazyhouse960_ratings.bullet}</td>
                                          <td>{this.props.profile.crazyhouse960_ratings.blitz}</td>
                                          <td>{this.props.profile.crazyhouse960_ratings.rapid}</td>
                                          <td>{this.props.profile.crazyhouse960_ratings.classic}</td>
                                        </tr>
                                      </tbody>
                                    </table>

                                </div>
                            </div>
                        </div>
                        <div className="col-xs-3">
                        </div>
                    </div>
                </div>
            );
        }

    }
}
function mapStateToProps(state) {
    return {
        profile: state.currentProfile,
    }
}

export default connect (mapStateToProps, {getUserProfile}) (Profile);
