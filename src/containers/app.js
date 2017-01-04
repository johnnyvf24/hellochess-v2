import React, {Component, PropTypes as T} from 'react';
import {connect} from 'react-redux';

class App extends Component {
    static contextTypes = {
        router: T.object
    }
    render() {
        const {dispatch, isAuthenticated, errorMessage} = this.props;
        let children = null;
        if (this.props.children) {
            children = React.cloneElement(this.props.children, {
                errorMessage: errorMessage,
                isAuthenticated: isAuthenticated,
                dispatch: dispatch
            })
        }
        return (
            <div>
                {children}
            </div>
        );
    }
}

App.T = {
    dispatch: T.func.isRequired,
    isAuthenticated: T.bool.isRequired,
    errorMessage: T.string
}

function mapStateToProps(state) {
    const {auth} = state;
    const {isAuthenticated, errorMessage} = auth;

    return {isAuthenticated, errorMessage}
}

export default connect(mapStateToProps)(App)
