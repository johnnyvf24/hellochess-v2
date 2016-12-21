import React, {Component} from 'react'

export default class SearchBar extends Component {

    constructor(props) {
        super(props);

        this.state = {term: ''};
    }

    render() {
        return (
            <div id="search-input-group" className="input-group">
                <input
                    type="text"
                    value={this.state.term}
                    onChange={(event) => {this.setState({term: event.target.value}) } }
                    className="form-control"
                    placeholder="Search a user, game #, forum entry, etc..." />

                <span className="input-group-btn">
                    <button
                        className="btn btn-secondary"
                        type="button">
                        Search
                    </button>
                </span>
            </div>
        );
    }

}
