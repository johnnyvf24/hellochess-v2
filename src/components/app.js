import React, {Component} from 'react';
import SearchBar from './search_bar';

export default class App extends Component {
    render() {
        return (
            <div className="row">
                <div className="col-xs-4"></div>
                <div className="col-xs-4">
                    <SearchBar />
                </div>
                <div className="col-xs-4"></div>
            </div>
        );
    }
}
