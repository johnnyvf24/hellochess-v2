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
app.set('port', process.env.PORT || 8080);

//listen to the required port
http.listen(app.get('port'), function() {
  console.log(`Express server listening on port ${app.get('port')}`);
});

//use middleware
app.use(bodyParser.json());
//serve up static public folder
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/api/users', (req, res) => {
    var body = _.pick(req.body, ['username','email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then(token => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.post('/api/users/login', (req, res) => {
    var body = _.pick(req.body, ['username', 'email', 'password']);

    User.findByCredentials(body.email, body.password).then(user=>{
        return user.generateAuthToken().then(token =>{
            res.header('x-auth', token).send(user);
        });
    }).catch( (e) => {
        res.status(400).send(e);
    });
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

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('action', (action) => {
        if (action.type === 'server/hello') {
            console.log('Got hello data!', action.data);
            socket.emit('action', {
                type: 'message',
                data: 'good day!'
            });
        }
    });
});
