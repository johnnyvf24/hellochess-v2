const Notifications = require('react-notification-system-redux');
const {mapObject} = require('../utils/utils');
const Elo = require('elo-js');
import Connection from './Connection';
import Player from './players/Player';
const Room = require('./rooms/Room');

//Game Rules
const FourGame = require('./games/FourGame');
const Standard = require('./games/Standard');
const CrazyHouse = require('./games/CrazyHouse');

module.exports.socketServer = function(io) {
    let conn = new Connection(io);
    io.on('connection', (socket) => {
        socket.on('connected-user', (data) => {
            console.log(data);
        });
    });
};
