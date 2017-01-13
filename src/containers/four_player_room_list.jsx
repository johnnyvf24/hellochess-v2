import React, {Component} from 'react';
import { connect } from 'react-redux';
import { mapObject } from '../utils/'

class FourPlayerRoomList extends Component {
    constructor (props) {
        super(props)
    }

    componentWillMount() {
        this.props.dispatch({
            type: 'server/get-four-player'
        })
    }

    renderRoomItems(room) {
        return mapObject(room, (key, value) => {
            console.log(value);
            return (
                <li key={key} className="list-group-item">
                    <div className="row">
                        <div className="col-xs-2">
                            {value.name}
                        </div>
                        <div className="col-xs-4">
                            {value.time.value + "min/" + value.time.increment + "sec"}
                        </div>
                        <div className="col-xs-3">
                            {value.host.username}
                        </div>
                        <div className="col-xs-3">
                            {value.users.length}
                        </div>
                    </div>
                </li>
            );
        });
    }

    render() {
        const { fourRooms } = this.props;
        return (
            <div
                className="tab-pane active"
                id="four-player-room-list"
                role="tabpanel"
                style={{padding: "0px"}}>
                <ul className="list-group">
                    {fourRooms.map(this.renderRoomItems)}
                </ul>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        fourRooms: state.fourPlayerRooms
    }
}

export default connect(mapStateToProps) (FourPlayerRoomList)
