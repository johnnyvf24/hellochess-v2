const {mapObject} = require('./utils/utils');
const Notifications = require('react-notification-system-redux');
const {Chess} = require('chess.js');
const Elo = require('elo-js');
const {User} = require('./models/user');
const {FourChess} = require('./game/fourchess');

let rooms = [];     //all the chat rooms
let clients = {};

function roomExists(name) {
    let foundMatch = false;
    for(let i = 0; i < rooms.length; i++) {
        mapObject(rooms[i], (key, val) => {
            if(key.toUpperCase() === name.toUpperCase()) {
                foundMatch = true;
            }
        });
    }
    return foundMatch;
}

function getRoomByName(name) {
    let obj = {};
    for(let i = 0; i < rooms.length; i++) {
        mapObject(rooms[i], (key, val) => {
            if(key.toUpperCase() === name.toUpperCase()) {
                obj = val;
            }
        });
    }

    return obj;
}

function findRoomIndexByName(name) {
    let index;
    for(let i = 0; i < rooms.length; i++) {
        mapObject(rooms[i], (key, val) => {
            if(key.toUpperCase() === name.toUpperCase()) {
                index = i;
            }
        });
    }

    return index;
}

function deleteRoomByName(name) {
    for(let i = 0; i < rooms.length; i++) {
        if(rooms[i] !== undefined) {
            mapObject(rooms[i], (key, val) => {
                if(key.toUpperCase() === name.toUpperCase()) {
                    rooms.splice(i, 1);
                }
            });
        }
    }

}

function getMemberBySocketId(socketId) {
    return clients[socketId];
}

//Format a turn for easier usage
function formatTurn(turn) {
    switch(turn) {
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

function getTimeTypeForTimeControl(game) {
    let tcIndex;
    //this time estimate is based on an estimated game length of 35 moves
    let totalTimeMs = (game.time.value * 60 * 1000) + (35 * game.time.increment * 1000);

    //Two player cutoff times
    let twoMins = 120000;   //two minutes in ms
    let eightMins = 480000;
    let fifteenMins = 900000;

    //four player cutoff times
    let fourMins = 240000;
    let twelveMins = 720000;
    let twentyMins = 12000000;

    switch(game.gameType) {
        case 'two-player':
            if( totalTimeMs <= twoMins) {
                //bullet
                tcIndex = 'bullet';
            } else if(totalTimeMs <= eightMins) {
                //blitz
                tcIndex = 'blitz';
            } else if(totalTimeMs <= fifteenMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return tcIndex;
        case 'four-player':
            if( totalTimeMs <= fourMins) {
                //bullet
                tcIndex = 'bullet';
            } else if(totalTimeMs <= twelveMins) {
                //blitz
                tcIndex = 'blitz';
            } else if(totalTimeMs <= twentyMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return tcIndex;
    }
}

function getEloForTimeControl(game, player) {
    let eloIndex, tcIndex;
    //this time estimate is based on an estimated game length of 35 moves
    let totalTimeMs = (game.time.value * 60 * 1000) + (35 * game.time.increment * 1000);

    //Two player cutoff times
    let twoMins = 120000;   //two minutes in ms
    let eightMins = 480000;
    let fifteenMins = 900000;

    //four player cutoff times
    let fourMins = 240000;
    let twelveMins = 720000;
    let twentyMins = 12000000;

    switch(game.gameType) {
        case 'two-player':
            eloIndex = 'two_elos';
            if( totalTimeMs <= twoMins) {
                //bullet
                tcIndex = 'bullet';
            } else if(totalTimeMs <= eightMins) {
                //blitz
                tcIndex = 'blitz';
            } else if(totalTimeMs <= fifteenMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return player[eloIndex][tcIndex];
        case 'four-player':
            eloIndex = 'four_elos';
            if( totalTimeMs <= fourMins) {
                //bullet
                tcIndex = 'bullet';
            } else if(totalTimeMs <= twelveMins) {
                //blitz
                tcIndex = 'blitz';
            } else if(totalTimeMs <= twentyMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return player[eloIndex][tcIndex];
    }
}

function deleteUserFromBoardSeats(io, index, roomName, userId) {
    let roomObj = rooms[index][roomName];
    if(roomObj.white) {
        if(roomObj.white._id === userId) {
            delete rooms[index][roomName].white;
            io.to(roomName).emit('action', {
                type: 'up-white',
                payload: {
                    name: roomName
                }
            });
        }
    }

    if(roomObj.black) {
        if(roomObj.black._id === userId) {
            delete rooms[index][roomName].black;
            io.to(roomName).emit('action', {
                type: 'up-black',
                payload: {
                    name: roomName
                }
            });
        }
    }

    if(roomObj.gold) {
        if(roomObj.gold._id === userId) {
            delete rooms[index][roomName].gold;
            io.to(roomName).emit('action', {
                type: 'up-gold',
                payload: {
                    name: roomName
                }
            });
        }
    }
    if(roomObj.red) {
        if(roomObj.red._id === userId) {
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

function userSittingAndGameOngoing(userObj, roomObj) {
    let user = userObj.user;
    if(roomObj.game) {
        if(roomObj.white && user._id === roomObj.white._id) {
            return true;
        }
        if(roomObj.black && user._id === roomObj.black._id) {
            return true;
        }
        if(roomObj.gold && user._id === roomObj.gold._id) {
            return true;
        }
        if(roomObj.red && user._id === roomObj.red._id) {
            return true;
        }
    }

    return false;
}

function endFourPlayerGame(io, roomName, index) {
    //pause the game
    io.to(roomName).emit('action', {
        type: 'pause',
        payload: {
            thread: roomName
        }
    });

    let elo = new Elo();

    let winnerColor = formatTurn(rooms[index][roomName].game.turn());
    let winner = rooms[index][roomName][winnerColor];

    let loserOrder = rooms[index][roomName].game.getLoserOrder();

    delete loserOrder[winnerColor];

    let firstOut, secondOut, thirdOut;
    mapObject(loserOrder, (key, player) => {
        if(player === 1) {
            firstOut = rooms[index][roomName][key];
        } else if(player === 2) {
            secondOut = rooms[index][roomName][key];
        } else if(player === 3) {
            thirdOut = rooms[index][roomName][key];
        }
    });

    let firstOutElo, secondOutElo, thirdOutElo, fourthOutElo;
    let timeType = getTimeTypeForTimeControl(rooms[index][roomName]);

    //get appropriate elos
    firstOutElo = getEloForTimeControl(rooms[index][roomName], firstOut);
    secondOutElo = getEloForTimeControl(rooms[index][roomName], secondOut);
    thirdOutElo = getEloForTimeControl(rooms[index][roomName], thirdOut);
    fourthOutElo = getEloForTimeControl(rooms[index][roomName], winner);

    //calculate average elo of the 3rd and 4th place
    let bottomAvgElo = (firstOutElo + secondOutElo) / 2;
    //calculate average elo of 1st and 2nd place
    let topAvgElo = (thirdOutElo + fourthOutElo) / 2;

    let wElo = elo.ifWins(topAvgElo, bottomAvgElo);
    let lElo = elo.ifLoses(bottomAvgElo, topAvgElo);

    let newFirstOutElo = (2 * (lElo-bottomAvgElo)) + firstOutElo;
    let newSecondOutElo = (lElo- bottomAvgElo) + secondOutElo;
    let newThirdOutElo = (wElo - topAvgElo) + thirdOutElo;
    let newWinnerElo = ((wElo - topAvgElo) * 2) + fourthOutElo;

    //console.log(`new ELos: winner: ${newWinnerElo} second: ${newThirdOutElo} third: ${newSecondOutElo} fourth: ${newFirstOutElo}`);

    //save the winner's elo
    User.findById({ _id: winner._id })
    .then((user) => {
        user.four_elos[timeType] = newWinnerElo;
        user.save(function(err, updatedUser) {
            let eloNotif = {
                title: `${winner.username}'s elo is now ${newWinnerElo} +${newWinnerElo - fourthOutElo}`,
                position: 'tr',
                autoDismiss: 5,
            };

            io.to(roomName).emit('action', Notifications.success(eloNotif));

            delete updatedUser.tokens;
            io.to(updatedUser.socket_id).emit('action', {
                type: 'user-update',
                payload: updatedUser
            });
        });
    }).catch((e) => {
        console.log(e);
    });

    setTimeout(() => {
        //Save 2nd place elo
        User.findById({ _id: thirdOut._id })
        .then((user) => {
            user.four_elos[timeType] = newThirdOutElo;
            user.save(function(err, updatedUser) {
                let eloNotif = {
                    title: `${thirdOut.username}'s elo is now ${newThirdOutElo} ${newThirdOutElo - thirdOutElo}`,
                    position: 'tr',
                    autoDismiss: 5,
                };

                io.to(roomName).emit('action', Notifications.success(eloNotif));

                delete updatedUser.tokens;
                io.to(updatedUser.socket_id).emit('action', {
                    type: 'user-update',
                    payload: updatedUser
                });
            });
        }).catch((e) => {
            console.log(e);
        });
    }, 250);

    setTimeout(() => {
        //Save 3rd place elo
        User.findById({ _id: secondOut._id })
        .then((user) => {
            user.four_elos[timeType] = newSecondOutElo;
            user.save(function(err, updatedUser) {
                let eloNotif = {
                    title: `${secondOut.username}'s elo is now ${newSecondOutElo} ${newSecondOutElo - secondOutElo}`,
                    position: 'tr',
                    autoDismiss: 5,
                };

                io.to(roomName).emit('action', Notifications.error(eloNotif));

                delete updatedUser.tokens;
                io.to(updatedUser.socket_id).emit('action', {
                    type: 'user-update',
                    payload: updatedUser
                });
            });
        }).catch((e) => {
            console.log(e);
        });
    }, 250);

    setTimeout(() => {
        //Save 4th place elo
        User.findById({ _id: firstOut._id })
        .then((user) => {
            user.four_elos[timeType] = newFirstOutElo;
            user.save(function(err, updatedUser) {
                let eloNotif = {
                    title: `${firstOut.username}'s elo is now ${newFirstOutElo} ${newFirstOutElo - firstOutElo}`,
                    position: 'tr',
                    autoDismiss: 5,
                };

                io.to(roomName).emit('action', Notifications.error(eloNotif));

                delete updatedUser.tokens;
                io.to(updatedUser.socket_id).emit('action', {
                    type: 'user-update',
                    payload: updatedUser
                });
            });
        }).catch((e) => {
            console.log(e);
        });
    }, 250);

    //Stop the clocks
    delete rooms[index][roomName].game;

    //kick players from board and restart game
    setTimeout(() => {
        delete rooms[index][roomName].white;
        delete rooms[index][roomName].black;
        delete rooms[index][roomName].gold;
        delete rooms[index][roomName].red;
        let boardNotif = {
            title: 'Board ready',
            position: 'tr',
            autoDismiss: 5,
        };
        io.to(roomName).emit('action', Notifications.warning(boardNotif));

        io.to(roomName).emit('action', {
            type: 'game-over',
            payload: roomName
        });

        //Update the information about that room
        io.emit('action', {
            type: 'all-rooms',
            payload: rooms
        });

        io.to(roomName).emit('action', {
            type: 'resume',
            payload: {
                thread: roomName
            }
        });
    }, 4500);
}

function endGame(io, timeType, wOldElo, lOldElo, winner, loser, roomIndex, roomName, draw) {

    //pause the game
    io.to(roomName).emit('action', {
        type: 'pause',
        payload: {
            thread: roomName
        }
    });

    let elo = new Elo();

    let wElo = elo.ifWins(wOldElo, lOldElo);
    let lElo = elo.ifLoses(lOldElo, wOldElo);

    if(draw) {
        wElo = elo.ifTies(wOldElo, lOldElo);
        lElo = elo.ifTies(lOldElo, wOldElo);
    }

    let updateObj = {};
    updateObj[timeType] = wElo;

    //save the winner's elo
    User.findById({ _id: winner._id })
    .then((user) => {
        user.two_elos[timeType] = wElo;
        user.save(function(err, updatedUser) {
            let eloNotif = {
                title: `${winner.username}'s elo is now ${wElo} +${wElo - wOldElo}`,
                position: 'tr',
                autoDismiss: 5,
            };
            if(draw) {
                io.to(roomName).emit('action', Notifications.info(eloNotif));
            } else {
                io.to(roomName).emit('action', Notifications.success(eloNotif));
            }
            delete updatedUser.tokens;
            io.to(updatedUser.socket_id).emit('action', {
                type: 'user-update',
                payload: updatedUser
            });
        });
    }).catch((e) => {

    });

    setTimeout(() => {
        //Save the loser's elo
        User.findById({ _id: loser._id })
        .then((user) => {
            user.two_elos[timeType] = lElo;
            user.save(function(err, updatedUser) {
                let eloNotif = {
                    title: `${loser.username}'s elo is now ${lElo} ${lElo - lOldElo}`,
                    position: 'tr',
                    autoDismiss: 5,
                };
                if(draw) {
                    io.to(roomName).emit('action', Notifications.info(eloNotif));
                } else {
                    io.to(roomName).emit('action', Notifications.error(eloNotif));
                }
                delete updatedUser.tokens;
                io.to(updatedUser.socket_id).emit('action', {
                    type: 'user-update',
                    payload: updatedUser
                });
            });
        }).catch((e) => {
        });
    }, 250);


    //TODO save game

    //Stop the clocks
    delete rooms[roomIndex][roomName].game;

    //kick both players from board and restart game
    setTimeout(() => {
        delete rooms[roomIndex][roomName].white;
        delete rooms[roomIndex][roomName].black;
        let boardNotif = {
            title: 'Board ready',
            position: 'tr',
            autoDismiss: 5,
        };
        io.to(roomName).emit('action', Notifications.warning(boardNotif));

        io.to(roomName).emit('action', {
            type: 'game-over',
            payload: roomName
        });

        //Update the information about that room
        io.emit('action', {
            type: 'all-rooms',
            payload: rooms
        });

        io.to(roomName).emit('action', {
            type: 'resume',
            payload: {
                thread: roomName
            }
        });
    }, 4000);
}

//Synchronize clocks every half second
function initTimerSync(io, roomName, index) {
    let synchronizer = setInterval(() =>{
        if(!rooms[index]) {
            clearInterval(synchronizer);
            return;
        }

        if(!rooms[index][roomName]) {
            clearInterval(synchronizer);
            return;
        }

        if(!rooms[index][roomName].game) {
            clearInterval(synchronizer);
            return;
        }
        let turn = rooms[index][roomName].game.turn();
        let lastMove = rooms[index][roomName].lastMove
        turn = formatTurn(turn);
        let timeElapsed = Date.now() - lastMove;
        let timeLeft = rooms[index][roomName][turn].time;
        let time = timeLeft - timeElapsed;
        if(time <= 200) { //200ms is the cutoff time
            time = 1;

            let loser, winner;
            if(turn === 'white') {
                winner = rooms[index][roomName].black;
                loser = rooms[index][roomName].white;
            } else if(turn === 'black'){
                winner = rooms[index][roomName].white;
                loser = rooms[index][roomName].black;
            }

            //Notify all players that the game has ended in a draw
            notificationOpts = {
                title: 'Game Over',
                message: `${winner.username} has defeated ${loser.username}`,
                position: 'tr',
                autoDismiss: 5,
            };

            io.to(roomName).emit('action', Notifications.info(notificationOpts));

            //get elos and calculate new elos
            timeType = getTimeTypeForTimeControl(rooms[index][roomName]);

            wOldElo = getEloForTimeControl(rooms[index][roomName], winner);
            lOldElo = getEloForTimeControl(rooms[index][roomName], loser);

            endGame(io, timeType, wOldElo, lOldElo, winner, loser, index, roomName, false)
        }
        io.to(roomName).emit('action', {
            type: 'timer-sync',
            payload: {
                thread: roomName,
                turn: turn,
                timeLeft: time
            }
        });
    }, 500);
}

module.exports = function(io) {

    //retrieve all the players in a particular room
    function getAllRoomMembers(room) {
        var roomMembers = [];
        mapObject(io.sockets.adapter.rooms[room].sockets, (key, val) => {
            roomMembers.push(clients[key].user);
        });
        return roomMembers;
    }

    io.on('connection', (socket) => {
        socket.on('action', (action) => {
            let roomName, roomObj, userObj, roomIndex, color, index, turn;
            let loser, winner, timeType, wOldElo, lOldElo, userObj2;
            let notificationOpts;
            switch(action.type) {
                //Client emiits message this after loading page
                case 'server/connected-user':

                    //Determine if this use is only logged in once
                    let foundDuplicate = false;
                    mapObject(clients, (key, val) => {
                        if(val.user._id === action.payload.user._id) {
                            //same user
                            foundDuplicate = true;
                        }
                    });
                    if(foundDuplicate) {
                        return socket.emit('action', {
                            type: 'duplicate-login'
                        });
                    } else {
                        //set the clients obj with the user's info
                        clients[socket.id] = action.payload;

                        //maintain a list of all the rooms this user is in.
                        clients[socket.id].rooms = [];
                        socket.username = action.payload.user.username;

                        socket.emit('action', {
                            type: 'connected'
                        });

                        //update the database, keep track of the socketid for that user
                        User.findById({ _id: action.payload.user._id })
                        .then((user) => {
                            user.socket_id = socket.id;
                            user.save(function(err, updatedUser) {
                                let notif = {
                                    title: `Welcome ${updatedUser.username}!`,
                                    position: 'tc',
                                    autoDismiss: 3,
                                };
                                io.to(socket.id).emit('action', Notifications.success(notif));
                            });
                        }).catch((e) => {
                        });
                    }

                    break;
                //client is sending new message
                case 'server/new-message':
                    io.to(action.payload.thread).emit('action', {
                        type: 'receive-message',
                        payload: action.payload
                    });
                    break;
                //a user is sending a draw request
                case 'server/draw':
                    roomName = action.payload.roomName;
                    userObj = clients[socket.id].user;

                    roomIndex = findRoomIndexByName(roomName);

                    if(rooms[roomIndex][roomName].white._id === userObj._id) {
                        userObj2 = rooms[roomIndex][roomName].black;
                        userObj = rooms[roomIndex][roomName].white;
                    } else {
                        userObj2 = rooms[roomIndex][roomName].white;
                        userObj = rooms[roomIndex][roomName].black;
                    }

                    User.findById(userObj2._id)
                    .then((user) => {
                        io.to(user.socket_id).emit('draw-request', {
                            thread: roomName
                        });

                        let notif = {
                            title: 'Draw request sent!',
                            position: 'tr',
                            autoDismiss: 2,
                        };
                        io.to(socket.id).emit('action', Notifications.info(notif));
                    }).catch((e) => {
                        console.log(e);
                    });

                    break;

                case 'server/accept-draw':
                    roomName = action.payload.roomName;
                    userObj = clients[socket.id].user;

                    roomIndex = findRoomIndexByName(roomName);

                    if(rooms[roomIndex][roomName].white._id === userObj._id) {
                        userObj2 = rooms[roomIndex][roomName].black;
                        userObj = rooms[roomIndex][roomName].white;
                    } else {
                        userObj2 = rooms[roomIndex][roomName].white;
                        userObj = rooms[roomIndex][roomName].black;
                    }

                    //Notify all players that the game has ended in a draw
                    notificationOpts = {
                        title: 'Game Over',
                        message: 'The game ended in a draw!',
                        position: 'tr',
                        autoDismiss: 5,
                    };

                    io.to(roomName).emit('action', Notifications.warning(notificationOpts));

                    //get elos and calculate new elos
                    timeType = getTimeTypeForTimeControl(rooms[roomIndex][roomName]);

                    wOldElo = getEloForTimeControl(rooms[roomIndex][roomName], userObj);
                    lOldElo = getEloForTimeControl(rooms[roomIndex][roomName], userObj2);

                    endGame(io, timeType, wOldElo, lOldElo, userObj, userObj2, roomIndex, roomName, true);
                    break;

                //a user is resigning
                case 'server/resign':
                    roomName = action.payload.roomName;
                    loser = clients[socket.id].user;
                    if(loser._id != action.payload.playerId) {
                        //TODO cheating?
                    }
                    roomIndex = findRoomIndexByName(roomName);

                    if(rooms[roomIndex][roomName].white._id === loser._id) {
                        winner = rooms[roomIndex][roomName].black;
                        loser = rooms[roomIndex][roomName].white;
                    } else {
                        winner = rooms[roomIndex][roomName].white;
                        loser = rooms[roomIndex][roomName].black;
                    }

                    //Notify all players that a player has resigned
                    notificationOpts = {
                        title: 'Game Over',
                        message: `${loser.username} has resigned. ${winner.username} has won!`,
                        position: 'tr',
                        autoDismiss: 5,
                    };

                    io.to(roomName).emit('action', Notifications.info(notificationOpts));

                    //get elos and calculate new elos
                    timeType = getTimeTypeForTimeControl(rooms[roomIndex][roomName]);

                    wOldElo = getEloForTimeControl(rooms[roomIndex][roomName], winner);
                    lOldElo = getEloForTimeControl(rooms[roomIndex][roomName], loser);

                    endGame(io, timeType, wOldElo, lOldElo, winner, loser, roomIndex, roomName, false);

                    break;

                case 'server/new-move':
                    roomName = action.payload.thread;
                    move = action.payload.move;
                    index = findRoomIndexByName(roomName);

                    //get who's turn it is
                    turn = rooms[index][roomName].game.turn()
                    turn = formatTurn(turn);

                    //make the move
                    move = rooms[index][roomName].game.move(move);
                    if(move === null) {
                        //handle cheating scenario
                    } else {
                        //calculate the time difference
                        let timeElapsed = Date.now() - rooms[index][roomName].lastMove;
                        rooms[index][roomName].lastMove = Date.now();
                        rooms[index][roomName][turn].time = rooms[index][roomName][turn].time - timeElapsed;
                        //Add the time increment
                        rooms[index][roomName][turn].time += rooms[index][roomName].time.increment * 1000;

                        io.to(roomName).emit('action', {
                            type: 'new-move',
                            payload: {
                                thread: roomName,
                                fen: rooms[index][roomName].game.fen(),
                                lastTurn: turn,
                                time: rooms[index][roomName][turn].time
                            }
                        })
                    }

                    //check to see if the game is over
                    if(rooms[index][roomName].game.game_over()) {

                        //get the loser
                        let nextTurn = rooms[index][roomName].game.turn();

                        nextTurn = formatTurn(nextTurn);

                        winner = rooms[index][roomName][turn].username;
                        loser = rooms[index][roomName][nextTurn].username;

                        if(rooms[index][roomName].game.in_draw()) {
                            //Notify all players that the game is ready to be played
                            const notificationOpts = {
                                title: 'Game Over',
                                message: `The game ended in a draw!`,
                                position: 'tr',
                                autoDismiss: 5,
                            };

                            io.to(roomName).emit('action', Notifications.warning(notificationOpts));

                            winner = rooms[index][roomName][turn];
                            loser = rooms[index][roomName][nextTurn];

                            timeType = getTimeTypeForTimeControl(rooms[index][roomName]);

                            wOldElo = getEloForTimeControl(rooms[index][roomName], winner);
                            lOldElo = getEloForTimeControl(rooms[index][roomName], loser);

                            endGame(io, timeType, wOldElo, lOldElo, winner, loser, index, roomName, true);
                        } else {
                            //Notify all players that the game is ready to be played
                            const notificationOpts = {
                                title: 'Game Over',
                                message: `${winner} is the winner`,
                                position: 'tr',
                                autoDismiss: 5,
                            };

                            io.to(roomName).emit('action', Notifications.warning(notificationOpts));

                            winner = rooms[index][roomName][turn];
                            loser = rooms[index][roomName][nextTurn];

                            timeType = getTimeTypeForTimeControl(rooms[index][roomName]);

                            wOldElo = getEloForTimeControl(rooms[index][roomName], winner);
                            lOldElo = getEloForTimeControl(rooms[index][roomName], loser);

                            endGame(io, timeType, wOldElo, lOldElo, winner, loser, index, roomName, false);
                        }
                    }
                    break;

                    case 'server/four-new-move':
                        roomName = action.payload.thread;
                        move = action.payload.move;
                        index = findRoomIndexByName(roomName);

                        //get who's turn it is
                        turn = rooms[index][roomName].game.turn()
                        turn = formatTurn(turn);

                        //make the move
                        move = rooms[index][roomName].game.move(move);
                        if(move.color) {
                            let loser = formatTurn(move.color);
                            let lostPlayer = rooms[index][roomName][loser].username;
                            const notificationOpts = {
                                title: 'Player Elimination',
                                message: `${lostPlayer} (${loser}) has been eliminated!`,
                                position: 'tr',
                                autoDismiss: 5,
                            };

                            io.to(roomName).emit('action', Notifications.info(notificationOpts));

                        }
                        if(move === null) {
                            //handle cheating scenario
                        } else {
                            let currentTurn;
                            if(rooms[index][roomName].game.inCheckMate()) {

                                currentTurn = formatTurn(rooms[index][roomName].game.turn());
                                currentPlayer = rooms[index][roomName][currentTurn].username;
                                const notificationOpts = {
                                    title: 'Checkmate',
                                    message: `${currentTurn} is in checkmate! ${currentPlayer}'s turn has been skipped.`,
                                    position: 'tr',
                                    autoDismiss: 5,
                                };

                                io.to(roomName).emit('action', Notifications.warning(notificationOpts));
                                rooms[index][roomName].game.nextTurn(); //move to next player
                            }
                            //calculate the time difference
                            let timeElapsed = Date.now() - rooms[index][roomName].lastMove;
                            rooms[index][roomName].lastMove = Date.now();
                            rooms[index][roomName][turn].time = rooms[index][roomName][turn].time - timeElapsed;
                            //Add the time increment
                            rooms[index][roomName][turn].time += rooms[index][roomName].time.increment * 1000;

                            io.to(roomName).emit('action', {
                                type: 'four-new-move',
                                payload: {
                                    thread: roomName,
                                    fen: rooms[index][roomName].game.fen(),
                                    currentTurn: rooms[index][roomName].game.turn(),
                                    lastTurn: turn,
                                    time: rooms[index][roomName][turn].time
                                }
                            })
                        }

                        //check to see if the game is over
                        if(rooms[index][roomName].game.game_over()) {

                            if(rooms[index][roomName].game.in_draw()) {

                            } else {
                                endFourPlayerGame(io, roomName, index);
                            }
                        }
                        break;

                //User is requesting to play as a certain color
                case 'server/sit-down-board':
                    roomName = action.payload.roomName;
                    userObj = action.payload.profile;
                    color = action.payload.color;
                    if(roomName && userObj && color) {
                        delete userObj.email;   //delete sensitive info
                        index = findRoomIndexByName(roomName);
                        roomObj = rooms[index];
                        deleteUserFromBoardSeats(io, index, roomName, userObj._id);
                        if(roomObj) {
                            switch(color) {
                                case 'w':
                                    if(!roomObj.white) {
                                        userObj.color = color;

                                        //initialize the players time (ms)
                                        userObj.time =
                                            rooms[index][roomName].time.value * 60 * 1000;

                                        rooms[index][roomName].white = userObj;

                                        //tell everyone in the room
                                        io.to(roomName).emit('action', {
                                            type: 'sit-down-white',
                                            payload: {
                                                thread: roomName,
                                                room: rooms[index][roomName].white
                                            }
                                        });
                                    }
                                    break;
                                case 'b':
                                    if(!roomObj.black) {
                                        userObj.color = color;

                                        //initialize the players time (ms)
                                        userObj.time =
                                            rooms[index][roomName].time.value * 60 * 1000;

                                        rooms[index][roomName].black = userObj;

                                        //tell everyone in the room
                                        io.to(roomName).emit('action', {
                                            type: 'sit-down-black',
                                            payload: {
                                                thread: roomName,
                                                room: rooms[index][roomName].black
                                            }
                                        });
                                    }
                                    break;
                                case 'g':
                                    if(!roomObj.gold) {
                                        userObj.color = color;

                                        //initialize the players time (ms)
                                        userObj.time =
                                            rooms[index][roomName].time.value * 60 * 1000;

                                        rooms[index][roomName].gold = userObj;
                                        //tell everyone in the room
                                        io.to(roomName).emit('action', {
                                            type: 'sit-down-gold',
                                            payload: {
                                                thread: roomName,
                                                room: rooms[index][roomName].gold
                                            }
                                        });
                                    }
                                    break;
                                case 'r':

                                    if(!roomObj.red) {
                                        userObj.color = color;

                                        //initialize the players time (ms)
                                        userObj.time =
                                            rooms[index][roomName].time.value * 60 * 1000;

                                        rooms[index][roomName].red = userObj;

                                        //tell everyone in the room
                                        io.to(roomName).emit('action', {
                                            type: 'sit-down-red',
                                            payload: {
                                                thread: roomName,
                                                room: rooms[index][roomName].red
                                            }
                                        });
                                    }
                                    break;
                                default:
                                    console.log("NOT a valid color");
                            }
                        }

                        if(rooms[index][roomName].gameType === "two-player") {
                            //Check to see if the game is ready to start
                            if(rooms[index][roomName].white && rooms[index][roomName].black) {

                                //Notify all players that the game is ready to be played
                                const notificationOpts = {
                                    title: 'The game has begun',
                                    message: '',
                                    position: 'tr',
                                    autoDismiss: 3,
                                };

                                io.to(roomName).emit('action', Notifications.warning(notificationOpts));
                                rooms[index][roomName].lastMove = Date.now();
                                rooms[index][roomName].turn = 'white';
                                rooms[index][roomName].game = new Chess();

                                io.to(roomName).emit('action', {
                                    type: 'game-started',
                                    payload: {
                                        thread: roomName,
                                        fen: rooms[index][roomName].game.fen(),
                                        pgn: rooms[index][roomName].game.pgn()
                                    }
                                })

                                //start first players timer
                                initTimerSync(io, roomName, index);
                            }
                        }

                        else if(rooms[index][roomName].gameType === "four-player") {
                            //Check to see if the game is ready to start
                            if(rooms[index][roomName].white && rooms[index][roomName].black
                               && rooms[index][roomName].gold && rooms[index][roomName].red) {

                                //Notify all players that the game is ready to be played
                                const notificationOpts = {
                                    title: 'The game has begun',
                                    message: '',
                                    position: 'tr',
                                    autoDismiss: 3,
                                };

                                io.to(roomName).emit('action', Notifications.warning(notificationOpts));
                                rooms[index][roomName].lastMove = Date.now();
                                rooms[index][roomName].turn = 'white';
                                rooms[index][roomName].game = new FourChess();

                                io.to(roomName).emit('action', {
                                    type: 'four-game-started',
                                    payload: {
                                        thread: roomName,
                                        fen: rooms[index][roomName].game.fen(),
                                        pgn: rooms[index][roomName].game.pgn()
                                    }
                                })

                                //start first players timer
                                initTimerSync(io, roomName, index);

                                //initialize state on both server and client
                            }
                        }
                    }
                    break;

                //client is leaving a game room
                case 'server/leave-room':
                    roomName = action.payload;
                    userObj = clients[socket.id];
                    roomIndex = findRoomIndexByName(roomName);

                    clients[socket.id].rooms = clients[socket.id].rooms.map((room) => {
                        if (room !== roomName) {
                            return room;
                        }
                    });

                    socket.leave(roomName);

                    socket.emit('action', {
                        type: 'left-room',
                        payload: roomName
                    });

                    //Tell everyone in the room that a user has disconnnected
                    io.to(roomName).emit('action', {
                        type: 'user-room-left',
                        payload: {
                            name: roomName,
                            user: userObj
                        }
                    });

                    if (io.sockets.adapter.rooms[roomName]) { //there are still users in the room

                        rooms[roomIndex][roomName].users = getAllRoomMembers(roomName);
                        if (!userSittingAndGameOngoing(userObj, rooms[roomIndex][roomName])) {
                            deleteUserFromBoardSeats(io, roomIndex, roomName, userObj.user._id);
                        }

                    } else { //this was the final user
                        deleteRoomByName(roomName);
                    }

                    //Update the user count for that room
                    io.emit('action', {
                        type: 'all-rooms',
                        payload: rooms
                    });
                    break;
                case 'server/join-room':
                    //TODO limit the number of rooms that a user can create
                    roomName = [Object.keys(action.payload)[0]];

                    //Deep copy the Chat object
                    roomObj = JSON.parse(JSON.stringify(action.payload[roomName]));

                    roomName = roomObj.room.name;

                    if(!roomExists(roomName)) {
                        rooms.push(action.payload);
                        io.emit('action', {
                            type: 'all-rooms',
                            payload: rooms
                        });
                    }

                    //connect this user to this react-notification-system-redux
                    socket.join(roomName);
                    clients[socket.id].rooms.push(roomName);

                    //Find the existing chat room
                    roomObj = getRoomByName(roomName);

                    if(roomObj.game) {
                        roomObj.fen = roomObj.game.fen();
                    }

                    //get the list of all room members
                    roomObj.users = getAllRoomMembers(roomName);
                    //add a list of messages for client side purposes
                    //TODO display last 10 messages
                    roomObj.messages = [];

                    //Tell the current user that they have joined the room
                    socket.emit('action', {
                        type: 'joined-room',
                        payload: roomObj
                    });

                    //Tell everyone in the room that a new user has connnected
                    io.to(roomName).emit('action', {
                        type: 'user-room-joined',
                        payload: roomObj
                    });

                    //Update the information about that room
                    io.emit('action', {
                        type: 'all-rooms',
                        payload: rooms
                    });
                    break;

                case 'server/get-rooms':
                    io.emit('action', {
                        type: 'all-rooms',
                        payload: rooms
                    });
                    break;
            }
        });

        socket.on('disconnect', function() {
            if(clients[socket.id]) {
                //Get all the rooms that user is connected to and the user info
                const userObj = clients[socket.id]
                const joinedRooms = userObj.rooms;
                // console.log(rooms)
                mapObject(joinedRooms, (key, val) => {
                    let roomIndex;
                    //Check to see if users are still in the room
                    if(io.sockets.adapter.rooms[val]) {
                        //Tell everyone that a user left
                        io.to(val).emit('action', {
                            type: 'user-room-left',
                            payload: {
                                name: val,
                                user: userObj
                            }
                        });

                        //update this specific room
                        roomIndex = findRoomIndexByName(val);
                        rooms[roomIndex][val].users = getAllRoomMembers(val);
                        if(!userSittingAndGameOngoing(userObj, rooms[roomIndex][val])) {
                            deleteUserFromBoardSeats(io, roomIndex, val, userObj.user._id);
                        }

                    } else {
                        //there are no users in this room
                        if(val) {
                            deleteRoomByName(val);
                        }

                    }
                })

            }

            //Tell all clients about potential room(s) changes
            io.emit('action', {
                type: 'all-rooms',
                payload: rooms
            });

            delete clients[socket.id];
        })
    });
};
