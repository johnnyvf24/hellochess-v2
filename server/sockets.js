var {mapObject} = require('./utils/utils');

let chatRooms = [];    //all the chat rooms
let clients = {};

function chatRoomExists(name) {
    let foundMatch = false;
    for(let i = 0; i < chatRooms.length; i++) {
        mapObject(chatRooms[i], (key, val) => {
            if(val.name.toUpperCase() === name.toUpperCase()) {
                foundMatch = true;
            }
        });
    }
    return foundMatch;
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
        // console.log(JSON.stringify(chatRooms, null, 2));
        socket.on('action', (action) => {
            let chatObjName, chatObj, chatUser = null;
            switch(action.type) {
                case 'server/connected-user':
                    clients[socket.id] = action.payload;
                    break;
                case 'server/new-message':
                    io.to(action.payload.thread).emit('action', {
                        type: 'receive-message',
                        payload: action.payload
                    });
                    break;
                case 'server/join-chat':
                    chatObjName = [Object.keys(action.payload)[0]];

                    //Deep copy the Chat object
                    chatObj = JSON.parse(JSON.stringify(action.payload[chatObjName]));

                    if(!chatRoomExists(chatObj.name)) {
                        chatRooms.push(action.payload);
                        io.emit('action', {
                            type: 'new-chatroom',
                            payload: chatRooms
                        });
                    }

                    //connect this user to this react-notification-system-redux
                    socket.join(chatObj.name);
                    //get the list of all members
                    chatObj.users = getAllRoomMembers(chatObj.name);

                    socket.emit('action', {
                        type: 'joined-chatroom',
                        payload: chatObj
                    });

                    //Tell everyone in the room that a new user has connnected
                    io.to(chatObj.name).emit('action', {
                        type: 'user-room-joined',
                        payload: chatObj
                    })

                    break;
                case 'server/new-chat':
                    chatObjName = [Object.keys(action.payload)[0]];
                    chatObj = JSON.parse(JSON.stringify(action.payload[chatObjName]));
                    delete action.payload[chatObjName].user;
                    if(!chatRoomExists(chatObj.name)) {
                        socket.join(chatObj.name);
                        chatRooms.push(action.payload);
                        io.emit('action', {
                            type: 'new-chatroom',
                            payload: chatRooms
                        });
                        chatObj.users = getAllRoomMembers(chatObj.name);
                        socket.emit('action', {
                            type: 'joined-chatroom',
                            payload: chatObj
                        });
                    } else {
                        io.emit('action', {
                            type: 'error',
                            payload: {
                                error: `Chat room with name '${chatObj.name}' already exists`
                            }
                        });
                    }
                    break;
                case 'server/get-chatrooms':
                    io.emit('action', {
                        type: 'new-chatroom',
                        payload: chatRooms
                    });
                    break;
            }
        });

        socket.on('disconnect', function() {

            mapObject(clients, (key, val) => {
                if(key === socket.id) {
                    delete clients[key];
                }
            });
            console.log('before', chatRooms);
            // chatRooms.map((chat, i) => {
            //     mapObject(chat, (key, value) => {
            //         if(!io.sockets.adapter.rooms[key]) {
            //             delete chatRooms[i];
            //         }
            //     });
            //
            // });
            console.log('after', chatRooms);

            // console.log('A client disconnected. There are ' + Object.keys(clients).length + ' sockets connected');
        })
    });
};
