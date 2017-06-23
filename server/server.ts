const fs = require('fs');
const dotenv = require('dotenv').load();
const express = require('express');
const app = express();

import {production, staging, local} from '../config/config';

const env = process.env.NODE_ENV || "development";

let http = require('http').createServer(app);

const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
let io = require('socket.io')(http);

const cors = require('cors');

const router = require('./router');
const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

let allowCrossDomain = null;

//CORS middleware for testing purposes
if(env == "production") {
    allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', [
            'https://www.hellochess.com'
        ]);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
        res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth');
        res.header('Access-Control-Expose-Headers', 'x-auth');
        next();
    }
} else {
    allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', [
            production,
            staging,
            local
        ]);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
        res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth');
        res.header('Access-Control-Expose-Headers', 'x-auth');
        next();
    }
}

const port = process.env.PORT || 8080;

//middleware
//app.use(morgan('combined'));
app.use(allowCrossDomain);
app.use(bodyParser.json());
//serve up static public folder
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1d'
}));


//listen to the required port
http.listen(port, function() {
    console.log(`Express server listening on port ${port}`);
});


process.on("uncaughtException", function(err) {
    console.log("uncaughtException:", err);
});

require('./sockets/sockets').socketServer(io);
router(app);
