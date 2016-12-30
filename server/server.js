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

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('new-message', message => {
        console.log(message);
        io.emit('receive-message', message);
    });
});

app.set('port', process.env.PORT || 8080);
app.use(bodyParser.json());
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

app.listen(app.get('port'), function() {
  console.log(`Express server listening on port ${app.get('port')}`);
});
