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

function findroomByName(name) {
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

function fourRoomExists(name) {

}

function getMemberBySocketId(socketId) {
    return clients[socketId];
}

module.exports = function(io) {

    function getAllRoomMembers(room) {
        var roomMembers = [];
        mapObject(io.sockets.adapter.rooms[room].sockets, (key, val) => {
            roomMembers.push(clients[key].user);
        });
        return roomMembers;
    }

    io.on('connection', (socket) => {
        // console.log(rooms);
        // console.log('connected clients: ', JSON.stringify(clients, null, 2));
        socket.on('action', (action) => {
            let roomName, roomObj, chatUser;
            switch(action.type) {
                case 'server/connected-user':
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
                case 'server/new-message':
                    io.to(action.payload.thread).emit('action', {
                        type: 'receive-message',
                        payload: action.payload
                    });
                    break;
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

                    break;
                case 'server/join-room':
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
                    roomObj = findroomByName(roomName);

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
                    io.to(roomObj.name).emit('action', {
                        type: 'user-room-joined',
                        payload: roomObj
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
                const {rooms} = clients[socket.id];
                // console.log(rooms)
                mapObject(rooms, (key, val) => {
                    if(io.sockets.adapter.rooms[val]) {
                        let obj = findroomByName(val);
                        obj.users = getAllRoomMembers(val);
                        io.to(val).emit('action', {
                            type: 'user-room-joined',
                            payload: obj
                        })
                    } else {
                        //there are no users in this room
                        delete rooms[val];
                    }
                })

            }
            delete clients[socket.id];
        })
    });
};
