
const Elo = require('elo-js');
const {mapObject} = require('../utils/utils');
const {User} = require('../models/user');
const Notifications = require('react-notification-system-redux');
const {clients, rooms, roomExists, getRoomByName, formatTurn} = require('./data');
const {getTimeTypeForTimeControl, getEloForTimeControl} = require('./data');
const {findRoomIndexByName, deleteUserFromBoardSeats} = require('./data');
const {deleteRoomByName, timers, fourComputers, twoComputers} = require('./data');
const {userSittingAndGameOngoing} = require('./data');

function startTimerCountDown(io, roomName, index) {

    if(!rooms[index]) {
        return;
    }

    if(!rooms[index][roomName]) {
        return;
    }

    if(!rooms[index][roomName].game) {
        return;
    }

    if(timers && timers[roomName]) {
        clearTimeout(timers[roomName]);
    }

    //get whos turn it is
    let turn = rooms[index][roomName].game.turn();
    //get when the last move was made
    let lastMove = rooms[index][roomName].lastMove;
    turn = formatTurn(turn);
    let timeElapsed = Date.now() - lastMove;
    //get how much time that player has left
    let timeLeft = rooms[index][roomName][turn].time;
    let time = timeLeft - timeElapsed;

    //start server timers
    timers[roomName] = setTimeout( function () {

        let loser, winner;

        if(!rooms[index] || !rooms[index][roomName] 
            || !rooms[index][roomName].gameType || !rooms[index][roomName].game) {
            // log rooms value
            return;
        }
        if(rooms[index][roomName].gameType == 'four-player') {
            rooms[index][roomName].lastMove = Date.now();
            loser = rooms[index][roomName][turn];
            //Notify all players that a player has lost on time
            notificationOpts = {
                title: `${loser.username} has lost on time!`,
                position: 'tr',
                autoDismiss: 5,
            };
            io.to(roomName).emit('action', Notifications.info(notificationOpts));
            if(!rooms[index] || !rooms[index][roomName] || !rooms[index][roomName].game) {
                return;
            }
            rooms[index][roomName].game.nextTurn();
            if(turn == 'white') {
                rooms[index][roomName].game.setWhiteOut();
                rooms[index][roomName].white.alive = false;
            }
            else if(turn == 'black') {
                rooms[index][roomName].game.setBlackOut();
                rooms[index][roomName].black.alive = false;
            }
            else if(turn == 'gold') {
                rooms[index][roomName].game.setGoldOut();
                rooms[index][roomName].gold.alive = false;
            }
            else if(turn == 'red') {
                rooms[index][roomName].game.setRedOut();
                rooms[index][roomName].red.alive = false;
            }

            if(rooms[index][roomName].game.game_over()) {
                //game over
                color = rooms[index][roomName].game.getWinnerColor();
                rooms[index][roomName].game.set_turn(color);

                endFourPlayerGame(io, roomName, index);
            } else {
                currentTurn = formatTurn(rooms[index][roomName].game.turn());
                io.to(roomName).emit('action', {
                    type: 'four-new-move',
                    payload: {
                        thread: roomName,
                        fen: rooms[index][roomName].game.fen(),
                        lastTurn: turn,
                        outColor: turn,
                        time: 1
                    }
                });

                //synchronize everyone's times again
                io.to(roomName).emit('action', {
                    type: 'timer-sync',
                    payload: {
                        thread: roomName,
                        turn: currentTurn,
                        timeLeft: rooms[index][roomName][currentTurn].time,
                        fen: rooms[index][roomName].game.fen()
                    }
                });

                if(rooms[index][roomName][currentTurn].type == "computer") {
                    fourComputers[roomName].setPosition(rooms[index][roomName].game.fen());

                    //tell the computer whose turn it is
                    fourComputers[roomName].setTurn(currentTurn);

                    if(rooms[index][roomName].game.isWhiteOut()) {
                        fourComputers[roomName].setOut('w');
                    }
                    if(rooms[index][roomName].game.isBlackOut()) {
                        fourComputers[roomName].setOut('b');
                    }
                    if(rooms[index][roomName].game.isGoldOut()) {
                        fourComputers[roomName].setOut('g');
                    }
                    if(rooms[index][roomName].game.isRedOut()) {
                        fourComputers[roomName].setOut('r');
                    }

                    let timeLeft = rooms[index][roomName][currentTurn].time;
                    fourComputers[roomName].go(timeLeft);
                }

                //call this method again to begin next players clock
                startTimerCountDown(io, roomName, index);

            }
        } else if(rooms[index][roomName].gameType == 'two-player' ||
                  rooms[index][roomName].gameType == 'crazyhouse'){
            time = 1;
            if(turn === 'white') {
                winner = rooms[index][roomName].black;
                loser = rooms[index][roomName].white;
            } else if(turn === 'black'){
                winner = rooms[index][roomName].white;
                loser = rooms[index][roomName].black;
            }

            //Notify all players that the game has ended
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

            endGame(io, timeType, wOldElo, lOldElo, winner, loser, index, roomName, false);
        }

    }, timeLeft);
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

    if (draw) {
        wElo = elo.ifTies(wOldElo, lOldElo);
        lElo = elo.ifTies(lOldElo, wOldElo);
    }

    let updateObj = {};
    updateObj[timeType] = wElo;

    //save the winner's elo
    User.findById({
            _id: winner._id
        })
        .then((user) => {
            user.two_elos[timeType] = wElo;
            user.save(function(err, updatedUser) {
                let eloNotif = {
                    title: `${winner.username}'s elo is now ${wElo} +${wElo - wOldElo}`,
                    position: 'tr',
                    autoDismiss: 5,
                };
                if (draw) {
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
        User.findById({
                _id: loser._id
            })
            .then((user) => {
                user.two_elos[timeType] = lElo;
                user.save(function(err, updatedUser) {
                    let eloNotif = {
                        title: `${loser.username}'s elo is now ${lElo} ${lElo - lOldElo}`,
                        position: 'tr',
                        autoDismiss: 5,
                    };
                    if (draw) {
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
            }).catch((e) => {});
    }, 250);


    //TODO save game

    //Stop the clocks
    delete rooms[roomIndex][roomName].game;
    clearTimeout(timers[roomName]);

    if(twoComputers[roomName]) {
        twoComputers[roomName].kill();
        delete twoComputers[roomName];
    }
    
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
};


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

    let newFirstOutElo = Math.round((2 * (lElo-bottomAvgElo)) + firstOutElo);
    let newSecondOutElo = Math.round((lElo- bottomAvgElo) + secondOutElo);
    let newThirdOutElo = Math.round((wElo - topAvgElo) + thirdOutElo);
    let newWinnerElo = Math.round(((wElo - topAvgElo) * 2) + fourthOutElo);

    //console.log(`new ELos: winner: ${newWinnerElo} second: ${newThirdOutElo} third: ${newSecondOutElo} fourth: ${newFirstOutElo}`);

    //save the winner's elo
    if(winner && winner._id) {
        User.findById({ _id: winner._id })
        .then((user) => {
            user.four_elos[timeType] = newWinnerElo;
            user.save(function(err, updatedUser) {

                if(updatedUser) {
                    let eloNotif = {
                        title: `${winner.username}'s elo is now ${newWinnerElo} +${newWinnerElo - fourthOutElo}`,
                        position: 'tr',
                        autoDismiss: 6,
                    };

                    io.to(roomName).emit('action', Notifications.success(eloNotif));

                    io.to(updatedUser.socket_id).emit('action', {
                        type: 'user-update',
                        payload: updatedUser
                    });
                }

            });
        }).catch((e) => {
            console.log(e);
        });
    }

    if(thirdOut && thirdOut._id) {
        setTimeout(() => {
            //Save 2nd place elo
            User.findById({ _id: thirdOut._id })
            .then((user) => {
                user.four_elos[timeType] = newThirdOutElo;
                user.save(function(err, updatedUser) {
                    if(updatedUser) {
                        let eloNotif = {
                            title: `${thirdOut.username}'s elo is now ${newThirdOutElo} ${newThirdOutElo - thirdOutElo}`,
                            position: 'tr',
                            autoDismiss: 6,
                        };

                        io.to(roomName).emit('action', Notifications.success(eloNotif));

                        io.to(updatedUser.socket_id).emit('action', {
                            type: 'user-update',
                            payload: updatedUser
                        });
                    }
                });
            }).catch((e) => {
                console.log(e);
            });
        }, 250);
    }

    if(secondOut && secondOut._id) {
        setTimeout(() => {
            //Save 3rd place elo
            User.findById({ _id: secondOut._id })
            .then((user) => {
                user.four_elos[timeType] = newSecondOutElo;
                user.save(function(err, updatedUser) {
                    if(updatedUser) {
                        let eloNotif = {
                            title: `${secondOut.username}'s elo is now ${newSecondOutElo} ${newSecondOutElo - secondOutElo}`,
                            position: 'tr',
                            autoDismiss: 6,
                        };

                        io.to(roomName).emit('action', Notifications.error(eloNotif));

                        io.to(updatedUser.socket_id).emit('action', {
                            type: 'user-update',
                            payload: updatedUser
                        });
                    }
                });
            }).catch((e) => {
                console.log(e);
            });
        }, 250);
    }

    if(firstOut && firstOut._id) {
        setTimeout(() => {
            //Save 4th place elo
            User.findById({ _id: firstOut._id })
            .then((user) => {
                user.four_elos[timeType] = newFirstOutElo;
                user.save(function(err, updatedUser) {
                    if(updatedUser) {
                        let eloNotif = {
                            title: `${firstOut.username}'s elo is now ${newFirstOutElo} ${newFirstOutElo - firstOutElo}`,
                            position: 'tr',
                            autoDismiss: 6,
                        };

                        io.to(roomName).emit('action', Notifications.error(eloNotif));

                        io.to(updatedUser.socket_id).emit('action', {
                            type: 'user-update',
                            payload: updatedUser
                        });
                    }
                });
            }).catch((e) => {
                console.log(e);
            });
        }, 250);
    }

    //Stop the clocks
    clearTimeout(timers[roomName]);
    delete rooms[index][roomName].game;


    if(fourComputers[roomName]) {
        fourComputers[roomName].kill();
        delete fourComputers[roomName];
    }

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
    }, 5000);
}

module.exports.startTimerCountDown = startTimerCountDown;
module.exports.endGame = endGame;
module.exports.endFourPlayerGame = endFourPlayerGame;
