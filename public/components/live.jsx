import React, {Component} from 'react';
import SearchBar from './search_bar';
import TwoBoard from './two_board';
import ChatViewer from './chat_viewer';
import NewGame from './new_game';
import AvailableRooms from './available_rooms';


class Live extends Component {

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-xs-4"></div>
                    <div className="col-xs-4">
                        <SearchBar />
                    </div>
                    <div className="col-xs-4"></div>
                </div>
                <div className="row">
                    <ChatViewer />
                    <div className="col-sm-6"></div>
                    <div className="col-sm-6 text-xs-center">
                        <NewGame />
                        <div className="row">
                            <div className="hidden-md-down col-lg-3"></div>
                            <div className="col-lg-6">
                                <TwoBoard />
                            </div>
                            <div className="hidden-md-down col-lg-3"></div>
                        </div>
                        <AvailableRooms />
                    </div>
                </div>
            </div>
        );
    }
}

export default Live;
