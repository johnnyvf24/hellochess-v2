import Player from '../logic/players/Player';

module.exports = function(io, socket, connection) {
    
    //Clients emit this event upon successfully establishing a connection
    //The server will track all users
    socket.on('connected-user', data => {
        if(!data._id || !data.picture) {
            return;
        }
        let p = new Player(socket, data._id, data.username, data.picture);
        
        connection.addPlayer(p);
    });
    
    socket.on('update-user', data => {
        //Used to update the username on the server when the user adds it
        connection.updatePlayer(data);
    });
};