import React, {Component} from 'react';
import {connect} from 'react-redux';
import {showError} from '../actions/index'

import Notifications from 'react-notification-system-redux';

class App extends Component {

    render() {
        const {notifications} = this.props;

        const style = {
            NotificationItem: { // Override the notification item
                DefaultStyle: { // Applied to every notification, regardless of the notification level
                    margin: '10px 5px 2px 1px'
                },

                success: { // Applied only to the success notification item
                    color: 'red'
                }
            }
        };

        return (
            <div id="main-content">
                <Notifications
                    notifications={notifications}
                    style={style}
                />
                {this.props.children}
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        notifications: state.notifications
    }
}

export default connect(mapStateToProps, {showError})(App)
