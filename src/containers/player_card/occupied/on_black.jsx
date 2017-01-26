import React, {Component} from 'react';
import {connect} from 'react-redux';

class OnBlack extends Component {

    millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    render() {
        const {player} = this.props;
        return (
            <div className="card player-card">
                <div className="card-block black-player">

                    <div className="row">
                        <img className="player-img rounded-circle" src={player.picture} />
                        <div className="card-text"><h5>{player.username}</h5>1245</div>
                    </div>

                    <h4 className="card-title pull-right">
                        {`${this.millisToMinutesAndSeconds(player.time)}`}
                    </h4>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        player: state.openThreads[state.activeThread].black
    }
}

export default connect(mapStateToProps)(OnBlack);
