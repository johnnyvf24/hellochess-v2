import React from 'react';
import {Route, IndexRoute} from 'react-router';

import App from './components/app';
import Login from './components/login';
import Live from './components/live';

export default (
    <Route path="/" component={App} >
        <IndexRoute component={Login} />
        <Route path="/live" component={Live} />
    </Route>
);
