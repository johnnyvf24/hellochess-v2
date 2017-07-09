import Player from '../../game_models/players/Player';
import Room from '../../game_models/rooms/Room';
import QueueItem from '../../game_models/matchmaking/QueueItem';

module.exports = function(io, socket, connection) {
    
    //The user wants to stop being paried
    socket.on('stop-pairing', () => {
        // Get the player that is requesting to be paried
        let player: Player = connection.getPlayerBySocket(socket);
        if(!player) {
            return;
        }
        connection.removePlayerFromQueue(player);
        
        player.socket.emit('stopped-pairing');
        connection.printQueue();
    });
    
    //the user is requesting to get paired at a certain time/inc
    socket.on('pair-me', (data) => {
        let timeControl : number = data.timeControl;
        let increment : number = data.increment;
        let gameType : string = data.gameType;
        
        // Get the player that is requesting to be paried
        let player: Player = connection.getPlayerBySocket(socket);
        let opponent: Player = null;
        if(!player) {
            return;
        }
        // remove any prior instances of this player from the queue
        connection.removePlayerFromQueue(player);
        
        // Get the current Queue
        let queue = connection.queue;
        
        // Search for an opponent (FIFO)
        for(let i = 0; i < queue.length; i++) {
            let entry: QueueItem = queue[i];
            
            //Currently all that is checked is if the timecontrol and the
            // gametype match up
            if( entry.timeControl === timeControl
                && entry.timeIncrement === increment
                && entry.gameType === gameType) {
                
                //Remove entry from queue
                connection.removeQueueEntryAtIndex(i);
                
                opponent = entry.player;
                break;
            }
        }
        
        let timeObj = {
            value: timeControl,
            increment: increment
        };
        
        if(opponent === null) {
            //No one was found
            let newEntry: QueueItem = new QueueItem(player, gameType, timeControl, increment);
            queue.push(newEntry);
            player.socket.emit('in-queue', data);
        } else {
            let roomObj = {
                name: player.username + ' vs ' + opponent.username,
                private: false,
                voiceChat: false,
                maxPlayers: 10000,
                roomMode: 'match',
            };
            //An opponent was found, start the game
            let room: Room = connection.createNewRoom(
                player.username + ' vs ' + opponent.username,
                data.gameType, timeObj, roomObj);
            room.addAllowedPlayerID(player.playerId);
            room.addAllowedPlayerID(opponent.playerId);
            if(!room) {
                return;
            }
            room.addPlayer(player);
            room.addPlayer(opponent);
            connection.emitAllRooms();
            
            let color: string = 'w';
            room.game.addPlayer(player, color);
            let timeValue = room.time.value * 60 * 1000;
            room.game.setColorTime(color, timeValue);
            
            color = 'b';
            room.game.addPlayer(opponent, color);
            timeValue = room.time.value * 60 * 1000;
            room.game.setColorTime(color, timeValue);
    
            if (room.gameReady()) {
                // start the game if all players are seated
                room.startGame(connection);
            }
            io.to(room.name).emit('update-room-full', room.getRoomObjFull());
            io.to(room.name).emit('matchmaking-complete', room.name);
        }
        connection.printQueue();
    });
};