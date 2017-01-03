import React, {Component,  PropTypes as T } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AuthService from '../utils/AuthService';
import SearchBar from './search_bar';
import TwoBoard from './two_board';
import ChatViewer from './chat_viewer';
import NewGame from './new_game';
import AvailableRooms from './available_rooms';

class Live extends Component {

    constructor(props, context) {
        super(props, context)
    }

    componentWillMount() {
        // this.props.getProfileInfo();
    }

    logout() {
        // destroys the session data
        this.props.auth.logout()
        // redirects to login page
        this.context.router.push('/login');
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-xs-4"></div>
                    <div className="col-xs-4">
                        <SearchBar/>
                    </div>
                    <div className="col-xs-4">
                        <div className="dropdown float-xs-right">
                            <a className="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <img id="profile-pic" className="img-fluid rounded-circle" src="" alt="" />
                            </a>

                            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
                                <a className="dropdown-item" onClick={this.logout.bind(this)} href="#">Logout</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <ChatViewer username=""/>
                    <div className="col-sm-6"></div>
                    <div className="col-sm-6 text-xs-center">
                        <NewGame/>
                        <div className="row">
                            <div className="hidden-md-down col-lg-3"></div>
                            <div className="col-lg-6">
                                <TwoBoard/>
                            </div>
                            <div className="hidden-md-down col-lg-3"></div>
                        </div>
                        <AvailableRooms/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Live;
