const Notifications = require('react-notification-system-redux');
const {mapObject} = require('../utils/utils');
const Elo = require('elo-js');
import Connection from './Connection';
import Player from './logic/players/Player';
const Room = require('./logic/rooms/Room');

//Game Rules
const FourGame = require('./logic/games/FourGame');
const Standard = require('./logic/games/Standard');
const CrazyHouse = require('./logic/games/CrazyHouse');

module.exports.socketServer = function(io) {
    let conn = new Connection(io);
    io.on('connection', (socket) => {
        require('./listeners/connection')(socket, conn);
        require('./listeners/room')(socket, conn);
    });
};
