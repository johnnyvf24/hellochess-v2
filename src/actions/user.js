import axios from 'axios'
import Notifications from 'react-notification-system-redux';
import {generateTokenHeader} from '../utils/index';
import {
    ROOT_URL,
    VIEW_PROFILE,
    VIEW_LEADERBOARD
} from './types'

export function getUserProfile (id) {
    return (dispatch) => {
        const tokenHeader = generateTokenHeader();
        axios.get(`${ROOT_URL}/api/users/${id}`, tokenHeader)
        .then((res) => {
            dispatch({type: VIEW_PROFILE, payload: res.data});
        })
        .catch(function (error) {
            const notificationOpts = {
                // uid: 'once-please', // you can specify your own uid if required
                title: 'Error could not get profile!',
                message: '',
                position: 'tc',
                autoDismiss: 0
            };

            //Show failed log in
            dispatch(
                Notifications.error(notificationOpts)
            );
        });
    };
}

export function getLeaderboard () {
    return (dispatch) => {
        const tokenHeader = generateTokenHeader();
        axios.get(`${ROOT_URL}/api/leaderboard`, tokenHeader)
        .then((res) => {
            dispatch({type: VIEW_LEADERBOARD, payload: res.data});
        })
        .catch(function (error) {
            const notificationOpts = {
                // uid: 'once-please', // you can specify your own uid if required
                title: 'Error could not get leaderboard!',
                message: `${error}`,
                position: 'tc',
                autoDismiss: 0
            };

            //Show failed log in
            dispatch(
                Notifications.error(notificationOpts)
            );
        });
    };
}
