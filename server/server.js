const fs = require('fs');
const express = require('express');
const app = express();
const httpapp = express();

const credentials = require('../config/config').credentials;

const http = require('http').createServer(httpapp);

httpapp.get('*', (req, res) => {
    res.redirect('https://hellochess.com'+req.url);
});

const https = require('https').createServer(credentials, app);
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const io = require('socket.io')(https);
const cors = require('cors');

const router = require('./router');
const {mongoose} = require('./db/mongoose');
const {TwoGame} = require('./models/two_game');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

//CORS middleware for testing purposes
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', ['http://localhost:8080']);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type,x-auth');
    res.header('Access-Control-Expose-Headers', 'x-auth');
    next();
}

//set port variable
app.set('port', process.env.PORT || 8443);
httpapp.set('httpport', 8080);

//middleware
app.use(morgan('combined'));
app.use(allowCrossDomain);
app.use(bodyParser.json());
//serve up static public folder
app.use(express.static(path.join(__dirname, '../public')));

httpapp.listen(httpapp.get('httpport'), function() {
    console.log(`http redirecting from port ${httpapp.get('httpport')}`);
});

//listen to the required port
https.listen(app.get('port'), function() {
  console.log(`Express server listening on port ${app.get('port')}`);
});

require('./sockets')(io);
router(app);
