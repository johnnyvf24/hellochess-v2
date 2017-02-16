const {mapObject} = require('../utils/utils');
const {clients, rooms} = require('./data');
const {User} = require('../models/user');
const Notifications = require('react-notification-system-redux');

function connection(io, socket, action){
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
                });

                //update the database, keep track of the socketid for that user
                User.findById({ _id: action.payload.user._id })
                .then((user) => {
                    user.socket_id = socket.id;
                    user.save(function(err, updatedUser) {
                        if(action.payload.user.username) {
                            let notif = {
                                title: `Welcome ${updatedUser.username}!`,
                                position: 'tc',
                                autoDismiss: 3,
                            };
                            io.to(socket.id).emit('action', Notifications.success(notif));
                        }
                    });
                }).catch((e) => {
                });

            }
            break;
    }

};

module.exports.connection = connection;
