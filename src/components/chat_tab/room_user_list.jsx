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
            <ul className="list-group">
                {this.props.users.map(this.renderUserListItem)}
            </ul>
        )
    }
}
