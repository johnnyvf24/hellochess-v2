import React from 'react';
import {Route, IndexRoute} from 'react-router';

import App from './containers/app';
import Login from './components/auth/login';
import Live from './containers/live';
import Profile from './containers/user/profile';
import RequireAuth from './components/auth/require_auth';

export default (
    <Route path="/" component={App} >
        <IndexRoute to="/" component={Login} />
        <Route path="/live" component={RequireAuth(Live)} />
        <Route path="/profile/:id" component={Profile}  />
    </Route>
);
