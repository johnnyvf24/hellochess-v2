import React, {Component} from 'react'

export default class ChatViewer extends Component {

    render() {
        return (
            <div id="chatbox-wrapper" className="col-sm-6">
                <div id="left-chatbox" className="card">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a className="nav-link active" data-toggle="tab" href="#global-chat">Global Chat</a>
                        </li>
                    </ul>
                    <div className="tab-content">
                        <div role="tabpanel" className="tab-pane active" id="global-chat">
                            <div className="row chatbox-top-stats">
                                <span className="float-xs-right">
                                    1000 chat members
                                </span>
                            </div>
                            <ul className="list-group chatbox-message-list">
                                <li className="list-group-item">
                                    <div className="float-xs-left">
                                        <img className="rounded-circle" title="User1" alt="40x40" data-src="holder.js/40x40/lava" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PGRlZnMvPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI0Y4NTkxQSIvPjxnPjx0ZXh0IHg9IjIiIHk9IjIwIiBzdHlsZT0iZmlsbDojMUMyODQ2O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWwsIEhlbHZldGljYSwgT3BlbiBTYW5zLCBzYW5zLXNlcmlmLCBtb25vc3BhY2U7Zm9udC1zaXplOjEwcHQ7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+NDB4NDA8L3RleHQ+PC9nPjwvc3ZnPg==" data-holder-rendered="true"  />
                                    </div>
                                    <div>
                                        <small className="list-group-item-heading text-muted text-primary">User1</small>
                                        <p className="list-group-item-text">
                                            Hi! this message is FOR you.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                            <div className="chatbox-input-send">
                                <div className="input-group">
                                    <input type="text" className="form-control" placeholder="Write a Message" />
                                    <span className="input-group-btn">
                                        <button className="btn btn-secondary" type="button">Send</button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
