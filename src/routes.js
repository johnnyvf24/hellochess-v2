import React from 'react';
import {Route, IndexRoute} from 'react-router';
import ReactGA from 'react-ga';

import App from './containers/app';
import Login from './components/auth/login';
import Live from './containers/live';
import RequireAuth from './components/auth/require_auth';

ReactGA.initialize('UA-71243957-2', {
    auto: true
});

function logPageView() {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
}

export default (
    <Route path="/" component={App} >
        <IndexRoute to="/" component={Login} onUpdate={logPageView} />
        <Route path="/live" component={RequireAuth(Live)} onUpdate={logPageView}  />
    </Route>
);
