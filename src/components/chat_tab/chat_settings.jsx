import React, {Component} from 'react';

export default class ChatSettings extends Component {
    constructor(props) {
        super(props);
    }

    renderSettingsModal(value) {

        return (
            <div className="modal fade" id="chatSettingsModal" role="dialog"  aria-hidden = "true" >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h5 className="modal-title" id="exampleModalLabel">{value.name} Settings</h5>
                        </div>
                        <div className="modal-body">
                            ...
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const {value} = this.props;

        if(value.host) {
            return (
                <div>
                    <a href="#"
                        data-toggle="modal"
                        data-target="#chatSettingsModal"
                        className="float-xs-left">
                        Settings
                    </a>
                    {this.renderSettingsModal(value)}
                </div>
            );
        }

        return null;
    }
}
