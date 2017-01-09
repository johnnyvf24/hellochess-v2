import React from 'react';
import {Route, IndexRoute} from 'react-router';

import App from './containers/app';
import Login from './containers/auth/login';
import Live from './containers/live';


export default (
    <Route path="/" component={App} >
        <IndexRoute to="/login" />
        <Route path="/live" component={Live} />
        <Route path="/login" component={Login} />
    </Route>
);
