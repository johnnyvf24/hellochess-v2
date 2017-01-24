import React, {Component} from 'react';
import SitWhite from '../../containers/empty_card/sit_white';
import SitBlack from '../../containers/empty_card/sit_black';
import SitGold from '../../containers/empty_card/sit_gold';
import SitRed from '../../containers/empty_card/sit_red';

export default class PlayerCard extends Component {

    constructor(props) {
        super(props);
    }

    renderEmptyCard(time, color) {
        switch(color) {
            case 'w':
                return <SitWhite time={time} />
            case 'b':
                return <SitBlack time={time} />
            case 'g':
                return <SitGold time={time} />
            case 'r':
                return <SitRed time={time} />
        }

    }

    renderCardWithPlayer(player, color) {

    }

    render() {
        let {player, time, color} = this.props
        if(!player) {
            //render regular card
            return this.renderEmptyCard(time, color);
        } else {
            return this.renderPlayerCard();
        }

        return (
            <div className="card player-card">
                <div className="card-block">

                    <div className="row">
                        <img className="player-img rounded-circle" src={profile.picture} />
                        <div className="card-text"><h5>{profile.username}</h5>1245</div>
                    </div>

                    <h4 className="card-title pull-right">{`${thread.time.value}:00`}</h4>
                </div>
            </div>
        );
    }
}
