const {mapObject} = require('./utils/utils');
const Notifications = require('react-notification-system-redux');

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

function findRoomByName(name) {
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
        // console.log("\n\n\n",JSON.stringify(rooms, null, 2));
        // console.log('connected clients: ', JSON.stringify(clients, null, 2));
        socket.on('action', (action) => {
            let roomName, roomObj, chatUser, roomIndex, color;
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
                        })
                    }

                    break;
                //client is sending new message
                case 'server/new-message':
                    io.to(action.payload.thread).emit('action', {
                        type: 'receive-message',
                        payload: action.payload
                    });
                    break;

                //User is requesting to play as a certain color
                case 'server/sit-down-board':

                    break;
                //client is leaving a game room
                case 'server/leave-room':
                    roomName = action.payload;
                    chatUser = clients[socket.id];
                    clients[socket.id].rooms = clients[socket.id].rooms.map((room) => {
                        if(room !== roomName) {
                            return room;
                        }
                    });

                    socket.leave(roomName);

                    socket.emit('action', {
                        type: 'left-room',
                        payload: roomName
                    });

                    //Tell everyone in the room that a new user has connnected
                    io.to(roomName).emit('action', {
                        type: 'user-room-left',
                        payload: {
                            name: roomName,
                            user: chatUser
                        }
                    });

                    if(io.sockets.adapter.rooms[roomName]) { //there are still users in the room
                        roomIndex = findRoomIndexByName(roomName);
                        rooms[roomIndex][roomName].users = getAllRoomMembers(roomName);
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
                    roomObj = findRoomByName(roomName);

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
                const chatUser = clients[socket.id]
                const joinedRooms = chatUser.rooms;
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
                                user: chatUser
                            }
                        });

                        //update this specific room
                        roomIndex = findRoomIndexByName(val);
                        rooms[roomIndex][val].users = getAllRoomMembers(val);

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
