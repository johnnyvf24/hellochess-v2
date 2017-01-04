import React from 'react';
import {Route, IndexRedirect} from 'react-router';

import AuthService from './utils/AuthService'

import App from './containers/app';
import Login from './components/login';
import Live from './containers/live';


export default (
    <Route path="/" component={App} >
        <IndexRedirect to="/live" />
        <Route path="/live" component={Live} />
        <Route path="/login" component={Login} />
    </Route>
);
