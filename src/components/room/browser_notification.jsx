import React, { Component } from 'react'
import Notification  from 'react-web-notification';

export default class BrowserNotification extends Component {
    constructor(props) {
        super(props);
        this.title = this.props.title || "HelloChess: It's your move.";
        this.body = this.props.body || "It's your move on HelloChess!";
        this.options = {
            body: this.body
        };
        this.ignore = true;
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }
    
    componentWillReceiveProps(nextProps) {
    }
    
    componentDidUpdate(prevProps, prevState) {
    }
    
    handlePermissionGranted() {
        
    }
    
    handlePermissionDenied() {
        
    }
    
    handleNotSupported() {
        
    }
    
    handleOnClick() {
        window.focus();
    }
    
    handleOnError() {
        
    }
    
    handleOnClose() {
        
    }
    
    handleOnShow() {
    }
    
    render() {
        return (
            <Notification
                ignore={this.props.ignore}
                notSupported={this.handleNotSupported.bind(this)}
                onPermissionGranted={this.handlePermissionGranted.bind(this)}
                onPermissionDenied={this.handlePermissionDenied.bind(this)}
                onShow={this.handleOnShow.bind(this)}
                onClick={this.handleOnClick.bind(this)}
                onClose={this.handleOnClose.bind(this)}
                onError={this.handleOnError.bind(this)}
                timeout={5000}
                title={this.props.title || ''}
                options={this.props.options}
            />
        );
    }
    
}