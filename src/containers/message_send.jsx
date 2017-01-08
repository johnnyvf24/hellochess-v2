import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

//The input where the users can send messages to a chat
class MessageSend extends Component {

    constructor(props) {
        super(props);
        this.state = {
            msg: ''
        };

        this.onInputChange = this.onInputChange.bind(this);
        this.onMessageSend = this.onMessageSend.bind(this);
    }

    onInputChange(event) {
        this.setState({msg: event.target.value});
    }

    onMessageSend(event) {
        const msg = this.state.msg;
        if(msg.length < 1) {
            event.preventDefault();
            return;
        }

        this.props.dispatch({
            type:'server/new-message',
            payload: {
                user: this.props.profile.user_metadata.username,
                msg: msg,
                thread: this.props.activeThread,
                picture: this.props.profile.picture
            }
        });
        this.setState({msg: ''});
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.onMessageSend} className="col-xs-12 chatbox-input-send">
                <div className="input-group">
                    <input
                        type="text"
                        value={this.state.msg}
                        onChange={this.onInputChange}
                        className="form-control"
                        placeholder="Write a Message" />
                    <span className="input-group-btn">
                        <button
                            type="submit"
                            className="btn btn-secondary">Send</button>
                    </span>
                </div>
            </form>
        );
    }
}

function mapStoreToProps(store) {
    return {
        messages: store.messages,
        profile: store.auth.profile,
        activeThread: store.activeThread
    };
}

export default connect(mapStoreToProps)(MessageSend);
