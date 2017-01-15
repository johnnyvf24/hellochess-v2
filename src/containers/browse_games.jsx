import React, { Component } from 'react';
import {connect} from 'react-redux';

export default class BrowseGames extends Component {

    clickItem() {
    }

    renderModalBody() {
        return (
            <table className="table">
            <thead className="thead-inverse">
            <tr>
                <th>Title</th>
                <th>Game Type</th>
                <th>Time Control</th>
                <th>Average Elo</th>
                <th># of players</th>
            </tr>
            </thead>
                <tbody>
                    <tr onClick={this.clickItem}>
                        <td>Let's party!</td>
                        <td>Two Player</td>
                        <td>5min/2sec</td>
                        <td>1245</td>
                        <td>10</td>
                    </tr>
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <div>

                <button type="button"
                    data-toggle="modal"
                    data-target="#browse-games-modal"
                    className="btn btn-warning">
                    Browse Games
                </button>

                {/* Start Modal */}
                <div className="modal fade"
                    id="browse-games-modal"
                    role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close"
                                    data-dismiss="modal"
                                    aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <h5 className="modal-title">
                                    Browse Games
                                </h5>
                            </div>
                            <div className="modal-body">
                                {this.renderModalBody()}
                            </div>
                            <div className="modal-footer">
                                <button type="button"
                                    className="btn btn-secondary"
                                    data-dismiss="modal">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}
