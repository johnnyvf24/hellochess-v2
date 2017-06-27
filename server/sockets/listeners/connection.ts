import Player from '../../game_models/players/Player';
import Room from '../../game_models/rooms/Room';

module.exports = function(io, socket, connection) {
    
    function disconnect() {
        //retrieve the user which has disconnected
        let player: Player = connection.getPlayerBySocket(socket);
        
        //If the player was searching for a game remove them from that game
        connection.removePlayerFromQueue(player);
        
        //get a list of rooms in which the player is in
        let rooms: Room [] = connection.getPlayerRoomsByPlayer(player);
        
       
        if(!rooms || !player) {
            //TODO error
            return;
        }
        
        //remove the player connection
        connection.removePlayer(player.playerId);
        
        rooms.map((room: Room) => {
            if(!room.removePlayer(player)) {
                //TODO error
                return;
            }
            
            if (room.empty()) { //there are no users in the room
                if(connection.removeRoomByName(room.name)) {
                    //TODO not sure if anything else is needed here
                } else {
                    console.log("could not delete room " + room.name);
                }
            } else {
                if(room.game && room.game.gameStarted == false) {
                    room.game.removePlayerFromAllSeats(player);
                }
                //tell everyone that the player has left the room
                io.to(room.name).emit('update-room', room.getRoom());
            }
        });
        
        connection.emitAllRooms();
    }
    
    //Clients emit this event upon successfully establishing a connection
    //The server will track all users
    socket.on('connected-user', data => {
        if(!data || !data._id || !data.picture) {
            return;
        }
        
        let IP = socket.request.connection.remoteAddress;
        console.log('client connected IP is ', IP);
        
        //TODO get player data from database instead of client
        let p = new Player(
            socket, data._id, data.username, data.picture,
            data.social, data.email,
            data.standard_ratings,
            data.schess_ratings,
            data.fourplayer_ratings,
            data.crazyhouse_ratings, data.crazyhouse960_ratings,
            data.fullhouse-chess_ratings,
            IP);
            
        //check to see if the player is already connected elsewhere
        if(connection.duplicateUser(data._id, IP) == true) {
            console.log('duplicate login');
            return socket.emit('duplicate-login');
        }
        
        connection.addPlayer(p);
    });
    
    socket.on('update-user', data => {
        //Used to update the username on the server when the user adds it
        connection.updatePlayer(data);
        
        // socket.emit('action', {type: 'update-user', payload: data})
    });
    
    //Handle error event
    socket.on("error", (err) => {
        console.log("Caught flash policy server socket error: ")
        console.log(err.stack);
    });
    
    socket.on('logout', data=> {disconnect()})
    
    socket.on('disconnect', (reason) => {
        disconnect();
        connection.printQueue();
    });
};