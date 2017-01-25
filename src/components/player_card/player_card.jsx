import React, {Component} from 'react';
import SitWhite from '../../containers/empty_card/sit_white';
import SitBlack from '../../containers/empty_card/sit_black';
import SitGold from '../../containers/empty_card/sit_gold';
import SitRed from '../../containers/empty_card/sit_red';
import OnWhite from './occupied/on_white';
import OnBlack from './occupied/on_black';

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
        switch(color) {
            case 'w':
                return <OnWhite player={player} />
            case 'b':
                return <OnBlack player={player} />
            case 'g':
                // return <OnGold time={time} />
            case 'r':
                // return <OnRed time={time} />
        }
    }

    render() {
        let {player, time, color} = this.props
        if(!player) {
            //render regular card
            return this.renderEmptyCard(time, color);
        } else {
            return this.renderCardWithPlayer(player, color);
        }
    }
}
