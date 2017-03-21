import React from 'react';
import { browserHistory } from 'react-router';
import {ListGroupItem, Row, Col} from 'react-bootstrap'

function formatTime(startTime) {
    startTime = new Date(startTime);
    
    // later record end time
    var endTime = new Date();
    
    // time difference in ms
    var timeDiff = endTime - startTime;

    // strip the ms
    timeDiff /= 1000;
    
    // get seconds (Original had 'round' which incorrectly counts 0:28, 0:29, 1:30 ... 1:59, 1:0)
    var seconds = Math.round(timeDiff % 60);
    
    // remove seconds from the date
    timeDiff = Math.floor(timeDiff / 60);
    
    // get minutes
    var minutes = Math.round(timeDiff % 60);
    
    // remove minutes from the date
    timeDiff = Math.floor(timeDiff / 60);
    
    // get hours
    var hours = Math.round(timeDiff % 24);
    
    // remove hours from the date
    timeDiff = Math.floor(timeDiff / 24);
    
    // the rest of timeDiff is number of days
    var days = timeDiff;
    
    if(days > 0) {
        return `${days} days ago`
    } else if(hours > 0) {
        return `${hours} hours ago`
    } else if(minutes > 0) {
        return `${minutes} minutes ago`
    } else if(seconds > 0) {
        return `${seconds} seconds ago`
    } else {
        return "just now"
    }
}

export default (props) => {
    //get prop data
    const text = props.text;
    const user = props.user;
    const uid = props.uid;
    const event_type = props.event_type;
    const time = formatTime(props.time);
    
    let message_item = <li></li>;
    
    switch(event_type) {
        case 'chat-message':
            const pic = props.picture;
            message_item =
                <ListGroupItem>
                    <div className="pull-left">
                        <a href="#"
                            onClick={(e) => browserHistory.push(`/profile/${uid}`)}>
                            <img className="img-circle msg-pic" title="User1" alt="User image" src={pic} data-holder-rendered="true"  />
                        </a>
                    </div>
                    <Row>
                        <div>
                            <small className="list-group-item-heading text-muted text-primary">{user}</small>
                            <p className="list-group-item-text message-text">
                                {text}
                            </p>
                        </div>
                        <div className="pull-right last-message-time">{time}</div>
                    </Row>
                </ListGroupItem>;
            break;
        case 'user-joined':
        case 'user-left':
            message_item =
                <ListGroupItem className="join-leave-message">
                    <div>
                        <small className={"list-group-item-heading " + event_type}>
                            {text}
                        </small>
                    </div>
                </ListGroupItem>;
            break;
    }
    return message_item;
}
