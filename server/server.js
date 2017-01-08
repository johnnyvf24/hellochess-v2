var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var bodyParser = require('body-parser');
var _ = require('lodash');
var io = require('socket.io')(http);

var {mongoose} = require('./db/mongoose');
var {TwoGame} = require('./models/two_game');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

//set port variable
app.set('port', process.env.PORT || 3000);

//listen to the required port
http.listen(app.get('port'), function() {
  console.log(`Express server listening on port ${app.get('port')}`);
});

//use middleware
app.use(bodyParser.json());
//serve up static public folder
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

app.get('/live', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

//Get all two player games (Dev only)
app.get('/api/twogames', (req, res) => {
    TwoGame.find({}).then((games) => {
        res.send(games);
    }, (e) => {
        res.status(400).send();
    })
});

app.post('/api/twogames', (req, res) => {
    console.log(req.body);
});




let chatRooms = [];    //all the chat rooms
let clients = {};

function mapObject(object, callback) {
    return Object.keys(object).map(function (key) {
    return callback(key, object[key]);
    });
}


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
        })
        console.log('A client disconnected. There are ' + Object.keys(clients).length + ' sockets connected');
    })
});
