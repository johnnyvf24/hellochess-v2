import Player from '../logic/players/Player';
import Room from '../logic/rooms/Room';

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
    
    socket.on('disconnect', (reason) => {

        //retrieve the user which has disconnected
        let player: Player = connection.getPlayerBySocket(socket);
        
        //get a list of rooms in which the player is in
        let rooms: Room[] = connection.getPlayerRoomsByPlayer(player);
        
        if(!rooms || !player) {
            //TODO error
        }
        
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
            }   
        });
        
        connection.emitAllRooms();
    });
};