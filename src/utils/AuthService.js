import { EventEmitter } from 'events'
import Auth0Lock from 'auth0-lock'
import { isTokenExpired } from './jwtHelper'
import { browserHistory } from 'react-router'

export default class AuthService extends EventEmitter {
    constructor(clientId, domain) {
        super()
        // Configure Auth0
        this.lock = new Auth0Lock(clientId, domain, {
            auth: {
                redirectUrl: 'http://localhost:8080/login',
                responseType: 'token'
            },
            theme: {
                logo: 'https://www.hellochess.com/img/alpha_banner.png'
            },
            languageDictionary: {
                emailInputPlaceholder: "your email",
                title: "Log in"
            },
        });
        // Add callback for lock `authenticated` event
        this.lock.on('authenticated', this._doAuthentication.bind(this))


            // binds login functions to keep this context
        this.login = this.login.bind(this)
    }

    _doAuthentication(authResult) {
        // Saves the user token
        this.setToken(authResult.idToken)
            // navigate to the home route
        browserHistory.replace('/live')
            // Async loads the user profile data
        this.lock.getProfile(authResult.idToken, (error, profile) => {
            if (error) {
                console.log('Error loading the Profile', error)
            } else {
                this.setProfile(profile)
            }
        })
    }

    // ...

    setProfile(profile) {
        // Saves profile data to local storage
        localStorage.setItem('profile', JSON.stringify(profile))
            // Triggers profile_updated event to update the UI
        this.emit('profile_updated', profile)
    }

    getProfile() {
        // Retrieves the profile data from local storage
        const profile = localStorage.getItem('profile')
        return profile ? JSON.parse(localStorage.profile) : {}
    }

    login() {
        // Call the show method to display the widget.
        this.lock.show()
    }

    loggedIn() {
        const token = this.getToken();
        // Checks if there is a saved token and it's still valid
        return !!token && !isTokenExpired(token);
    }

    setToken(idToken) {
        // Saves user token to local storage
        localStorage.setItem('id_token', idToken)
    }

    getToken() {
        // Retrieves the user token from local storage
        return localStorage.getItem('id_token')
    }

    logout() {
        // Clear user token and profile data from local storage
        localStorage.removeItem('id_token');
    }
}
