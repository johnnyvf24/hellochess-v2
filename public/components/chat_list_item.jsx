import React from 'react';

export default (props) => {
    var text = props.text;
    return (
        <li className="list-group-item">
            <div className="float-xs-left">
                <img className="rounded-circle" title="User1" alt="40x40" data-src="holder.js/40x40/lava" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PGRlZnMvPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI0Y4NTkxQSIvPjxnPjx0ZXh0IHg9IjIiIHk9IjIwIiBzdHlsZT0iZmlsbDojMUMyODQ2O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWwsIEhlbHZldGljYSwgT3BlbiBTYW5zLCBzYW5zLXNlcmlmLCBtb25vc3BhY2U7Zm9udC1zaXplOjEwcHQ7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+NDB4NDA8L3RleHQ+PC9nPjwvc3ZnPg==" data-holder-rendered="true"  />
            </div>
            <div>
                <small className="list-group-item-heading text-muted text-primary">User1</small>
                <p className="list-group-item-text">
                    {text}
                </p>
            </div>
        </li>
    );
}
