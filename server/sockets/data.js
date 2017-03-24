const {mapObject} = require('../utils/utils');
let rooms = [];
let timers = {};
let clients = {};
let fourComputers = [];
let twoComputers = [];
let nextRoomId = 0;

let commentator = null;

module.exports.rooms = rooms; //all the chat rooms
module.exports.timers = timers; //all the timers
module.exports.clients = clients; //all connected users
module.exports.fourComputers = fourComputers;
module.exports.twoComputers = twoComputers;
module.exports.commentator = commentator;

module.exports.roomExists = function(name) {
    let foundMatch = false;
    for (let i = 0; i < rooms.length; i++) {
        mapObject(rooms[i], (key, val) => {
            if (key.toUpperCase() === name.toUpperCase()) {
                foundMatch = true;
            }
        });
    }
    return foundMatch;
}

module.exports.getRoomByName = function(name) {
    if(!name) {
        return;
    }
    let obj = {};
    for (let i = 0; i < rooms.length; i++) {
        mapObject(rooms[i], (key, val) => {
            if (key.toUpperCase() === name.toUpperCase()) {
                obj = val;
            }
        });
    }

    return obj;
}

module.exports.removeTimersFromRooms = function(rooms) {
    let roomsc = [];
    for (let i = 0; i < rooms.length; i++) {
        let room = rooms[i]
        mapObject(rooms[i], (key, val) => {
            if (key != "time") {
                room[key] = val;
            }
        });
        roomsc.push(room);
    }

    return roomsc;
}

module.exports.deleteRoomByName = function(roomName) {
    if(fourComputers[roomName]) {
        fourComputers[roomName].stdin.pause();
        fourComputers[roomName].kill();
        delete fourComputers[roomName];
    }
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i] !== undefined) {
            mapObject(rooms[i], (key, val) => {
                if (key.toUpperCase() === roomName.toUpperCase()) {
                    rooms.splice(i, 1);
                }
            });
        }
    }
}

module.exports.findRoomIndexByName = function(name) {
    let index;
    for (let i = 0; i < rooms.length; i++) {
        mapObject(rooms[i], (key, val) => {
            if (key.toUpperCase() === name.toUpperCase()) {
                index = i;
            }
        });
    }

    return index;
}

module.exports.getMemberBySocketId = function(socketId) {
    return clients[socketId];
}

//Format a turn for easier usage
module.exports.formatTurn = function(turn) {
        switch (turn) {
            case 'w':
                return 'white';
            case 'b':
                return 'black';
            case 'g':
                return 'gold';
            case 'r':
                return 'red';
        }
        return undefined;
    }
    //retrieve all the players in a particular room//retrieve all the players in a particular room
module.exports.getAllRoomMembers = function(io, room) {
    var roomMembers = [];
    mapObject(io.sockets.adapter.rooms[room].sockets, (key, val) => {
        if(clients[key].user) {
            roomMembers.push(clients[key].user);
        }
    });
    return roomMembers;
}

module.exports.getTimeTypeForTimeControl = function(game) {
    let tcIndex;
    //this time estimate is based on an estimated game length of 35 moves
    let totalTimeMs = (game.time.value * 60 * 1000) + (35 * game.time.increment * 1000);

    //Two player cutoff times
    let twoMins = 120000; //two minutes in ms
    let eightMins = 480000;
    let fifteenMins = 900000;

    //four player cutoff times
    let fourMins = 240000;
    let twelveMins = 720000;
    let twentyMins = 12000000;

    switch (game.gameType) {
        case 'two-player':
        case 'crazyhouse':
        case 'crazyhouse960':
            if (totalTimeMs <= twoMins) {
                //bullet
                tcIndex = 'bullet';
            } else if (totalTimeMs <= eightMins) {
                //blitz
                tcIndex = 'blitz';
            } else if (totalTimeMs <= fifteenMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return tcIndex;
        case 'four-player':
            if (totalTimeMs <= fourMins) {
                //bullet
                tcIndex = 'bullet';
            } else if (totalTimeMs <= twelveMins) {
                //blitz
                tcIndex = 'blitz';
            } else if (totalTimeMs <= twentyMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return tcIndex;
    }
}

module.exports.getEloForTimeControl = function(game, player) {
    if(!player || !game) {
        return;
    }
    let eloIndex, tcIndex;
    //this time estimate is based on an estimated game length of 35 moves
    let totalTimeMs = (game.time.value * 60 * 1000) + (35 * game.time.increment * 1000);

    //Two player cutoff times
    let twoMins = 120000; //two minutes in ms
    let eightMins = 480000;
    let fifteenMins = 900000;

    //four player cutoff times
    let fourMins = 240000;
    let twelveMins = 720000;
    let twentyMins = 12000000;

    switch (game.gameType) {
        case 'two-player':
        case 'crazyhouse':
        case 'crazyhouse960':
            eloIndex = 'two_elos';
            if (totalTimeMs <= twoMins) {
                //bullet
                tcIndex = 'bullet';
            } else if (totalTimeMs <= eightMins) {
                //blitz
                tcIndex = 'blitz';
            } else if (totalTimeMs <= fifteenMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return player[eloIndex][tcIndex];
        case 'four-player':
            eloIndex = 'four_elos';
            if (totalTimeMs <= fourMins) {
                //bullet
                tcIndex = 'bullet';
            } else if (totalTimeMs <= twelveMins) {
                //blitz
                tcIndex = 'blitz';
            } else if (totalTimeMs <= twentyMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return player[eloIndex][tcIndex];
    }
}

module.exports.deleteUserFromBoardSeats = function(io, index, roomName, userId) {
    let roomObj = rooms[index][roomName];
    if (roomObj.white) {
        if (roomObj.white._id === userId) {
            delete rooms[index][roomName].white;
            io.to(roomName).emit('action', {
                type: 'up-white',
                payload: {
                    name: roomName
                }
            });
        }
    }

    if (roomObj.black) {
        if (roomObj.black._id === userId) {
            delete rooms[index][roomName].black;
            io.to(roomName).emit('action', {
                type: 'up-black',
                payload: {
                    name: roomName
                }
            });
        }
    }

    if (roomObj.gold) {
        if (roomObj.gold._id === userId) {
            delete rooms[index][roomName].gold;
            io.to(roomName).emit('action', {
                type: 'up-gold',
                payload: {
                    name: roomName
                }
            });
        }
    }
    if (roomObj.red) {
        if (roomObj.red._id === userId) {
            delete rooms[index][roomName].red;
            io.to(roomName).emit('action', {
                type: 'up-red',
                payload: {
                    name: roomName
                }
            });
        }
    }
}

module.exports.userSittingAndGameOngoing = function(userObj, roomObj) {
    let user = userObj.user;
    if (roomObj.game) {
        if (roomObj.white && user._id === roomObj.white._id) {
            return true;
        }
        if (roomObj.black && user._id === roomObj.black._id) {
            return true;
        }
        if (roomObj.gold && user._id === roomObj.gold._id) {
            return true;
        }
        if (roomObj.red && user._id === roomObj.red._id) {
            return true;
        }
    }

    return false;
}

module.exports.addMessageToRoom = function(roomName, message) {
    let room = module.exports.getRoomByName(roomName);
    if (room.messages) {
        room.messages.push(message);
    } else {
        room.messages = [];
    }
}

module.exports.getRecentMessages = function(roomName) {
    let room = module.exports.getRoomByName(roomName);
    const NUM_MESSAGE_HISTORY = 50;
    let messages;
    if (room.messages) {
        messages = room.messages.filter(m => m !== null).slice(-NUM_MESSAGE_HISTORY);
    } else {
        messages = [];
    }
    return messages;
}

module.exports.newRoomId = function() {
    let id = nextRoomId;
    nextRoomId += 1;
    return id;
}
