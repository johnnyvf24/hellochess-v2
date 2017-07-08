import React, {Component} from 'react';

export default class RoomUserList extends Component {
    constructor(props) {
        super(props);
    }

    renderUserListItem(user) {
        return (
            <li
                key={user._id}
                className="list-group-item">
                {user.username}
            </li>
        );
    }
    

    render() {
        return (
            <div>
                <ul className="list-group">
                    {this.props.users
                        .filter(user => user.anonymous !== true)
                        .map(this.renderUserListItem)}
                </ul>
                <div style={
                    {"bottom":"0px"},
                    {"position": "absolute"},
                    {"margin-bottom": "5px"}
                }>
                    Anonymous:&nbsp;
                    {this.props.users
                        .filter(user => user.anonymous === true)
                        .length}
                </div>
            </div>
        )
    }
}
