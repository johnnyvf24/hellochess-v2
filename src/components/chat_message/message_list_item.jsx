import React from 'react';

export default (props) => {
    const text = props.text;
    const user = props.user;
    const event_type = props.event_type;
    let message_item = <li></li>;
    switch(event_type) {
        case 'chat-message':
            const pic = props.picture;
            message_item =
                <li className="list-group-item">
                    <div className="float-xs-left">
                        <img className="rounded-circle msg-pic" title="User1" alt="40x40" src={pic} data-holder-rendered="true"  />
                    </div>
                    <div>
                        <small className="list-group-item-heading text-muted text-primary">{user}</small>
                        <p className="list-group-item-text">
                            {text}
                        </p>
                    </div>
                </li>;
            break;
        case 'user-joined':
        case 'user-left':
            message_item =
                <li className="list-group-item join-leave-message">
                    <div>
                        <small className={"list-group-item-heading " + event_type}>
                            {text}
                        </small>
                    </div>
                </li>;
            break;
    }
    return message_item;
}
