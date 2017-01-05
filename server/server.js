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

let numConnectedUsers = 0;  //total users connected
let chatRooms = [];    //all the chat rooms
io.on('connection', (socket) => {
    io.emit('action', {
        type: 'update-user-count',
        payload: {
            name:  'global',
            count: ++numConnectedUsers
        }
    });
    socket.on('action', (action) => {
        switch(action.type) {
            case 'server/new-message':
                io.emit('action', {
                    type: 'receive-message',
                    payload: action.payload
                });
                break;
            case 'server/join-chat':
                break;
            case 'server/new-chatroom':
                socket.join(action.payload);
                chatRooms.push(action.payload);
                socket.broadcast.emit('new-chatroom');
                console.log(chatRooms);
                break;
        }
    });
});
