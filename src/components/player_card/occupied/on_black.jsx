import React, {Component} from 'react';

export default class OnBlack extends Component {
    constructor(props) {
        super(props);
    }

    millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    render() {
        const {player} = this.props;
        return (
            <div className="card player-card">
                <div className="card-block player-black">

                    <div className="row">
                        <img className="player-img rounded-circle" src={player.picture} />
                        <div className="card-text"><h5>{player.username}</h5>1245</div>
                    </div>

                    <h4
                        className="card-title pull-right"
                    >
                        {`${this.millisToMinutesAndSeconds(player.time)}`}
                    </h4>
                </div>
            </div>
        );
    }
}
