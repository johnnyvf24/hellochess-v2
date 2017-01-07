import React from 'react';

export default (props) => {
    const text = props.text;
    const user = props.user;
    const pic = props.picture;
    return (
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
        </li>
    );
}
