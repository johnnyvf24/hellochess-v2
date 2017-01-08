const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const io = require('socket.io')(http);
const router = require('./router');

const {mongoose} = require('./db/mongoose');
const {TwoGame} = require('./models/two_game');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

//set port variable
app.set('port', process.env.PORT || 3000);

//listen to the required port
http.listen(app.get('port'), function() {
  console.log(`Express server listening on port ${app.get('port')}`);
});

//use middleware
// app.use(morgan('combined'));
app.use(bodyParser.json());
//serve up static public folder
app.use(express.static(path.join(__dirname, '../public')));

require('./sockets')(io);
router(app);
