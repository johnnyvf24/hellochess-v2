import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import sendMessage from '../actions/index';

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
        this.setState({msg: event.target.value})
    }

    onMessageSend(event) {
        this.props.dispatch({type:'server/newmessage', payload:this.state.msg});
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.onMessageSend} className="chatbox-input-send">
                <div className="input-group">
                    <input
                        type="text"
                        value={this.state.value}
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
        socket: store.socket
    };
}

export default connect(mapStoreToProps, sendMessage)(MessageSend);
