// import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';
import Notifications from 'react-notification-system-redux';

let socket = null;

export function socketIoMiddleware(store) {
    
    return next => action => {
        const result = next(action);
        if(!socket) {
            return;
        }

        switch(action.type) {
            case 'server/connected-user': 
                let profile = store.getState().auth.profile;
                socket.emit('connected-user', profile);
                break;
            case 'server/update-user':
                socket.emit('update-user', action.payload);
                break;
            case 'server/create-room':
                socket.emit('create-room', action.payload);
                break;
            case 'server/join-room':
                socket.emit('join-room', action.payload);
                break;
            case 'server/leave-room':
                socket.emit('leave-room', action.payload);
                break;
            case 'server/new-message':
                socket.emit('new-message', action.payload);
                break;
            case 'server/sit-down-board':
                socket.emit('sit-down-board', action.payload);
                break;
            case 'server/new-move':
                socket.emit('new-move', action.payload);
                break;
            case 'server/four-new-move':
                socket.emit('four-new-move', action.payload);
                break;
            case 'server/four-resign':
                socket.emit('four-resign', action.payload);
                break;
            case 'server/draw':
                socket.emit('draw', action.payload);
                break;
            case 'server/accept-draw':
                socket.emit('accept-draw', action.payload);
                break;
            case 'server/resign':
                socket.emit('resign', action.payload);
                break;
            case 'server/logout':
                socket.emit('logout', action.payload);
                break;
            case 'server/remove-ai-player':
                socket.emit('remove-ai-player', action.payload);
                break;
            case 'server/kill-ais':
                socket.emit('kill-ais', action.payload);
                break;
        } 
     
        return result;
    }
}

export default function(store) {
    if (process.env.NODE_ENV === "production") {
        socket = io.connect('https://www.hellochess.com');
    } else if (process.env.NODE_ENV === "staging") {
        socket = io.connect('https://hellochess-dev-johnnyvf24.c9users.io');
    } else if(process.env.NODE_ENV === "dev2") {
        socket = io.connect('https://hellochess-johnnyvf24.c9users.io');
    } else {
        socket = io.connect('http://localhost:3000');
    }

    socket.on('connected-user', data => {
        store.dispatch({type: 'connected-user'});
    });
    
    socket.on('draw-request', data => {
        let notif = {
            title: 'Your opponent has offered a draw',
            position: 'tc',
            autoDismiss: 6,
            action: {
                label: 'Accept',
                callback: () => {
                    socket.emit('accept-draw', {
                        roomName: data.thread
                    });
                }
            }
        };
        store.dispatch(Notifications.info(notif));
    });
    
    //a list of all the rooms has been sent by the server
    socket.on('all-rooms', data => {
        store.dispatch({type: 'all-rooms', payload: data}); 
    });
    
    //User has successfully joined a room
    socket.on('update-room', data => {
        store.dispatch({type: 'update-room', payload: data}); 
    });
    
    socket.on('sit-down-w', data => {
        store.dispatch({type: 'sit-down-w', payload: data});
    });
    
    socket.on('sit-down-b', data => {
        store.dispatch({type: 'sit-down-b', payload: data});
    });
    
    socket.on('sit-down-g', data => {
        store.dispatch({type: 'sit-down-g', payload: data});
    });
    
    socket.on('sit-down-r', data => {
        store.dispatch({type: 'sit-down-r', payload: data});
    });
    
    socket.on('left-room', data => {
        store.dispatch({type: 'left-room', payload: data});
    });
    
    socket.on('user-room-left', data => {
        store.dispatch({type: 'user-room-left', payload: data});
    });
    
    socket.on('user-room-joined', data => {
        store.dispatch({type: 'user-room-joined', payload: data});
    });
    
    socket.on('disconnect', data => {
        store.dispatch({type: 'disconnect'});
    });
    
    socket.on('reconnect', data => {
        store.dispatch({type: 'reconnect'});
    });
    
    socket.on('pause', data => {
        store.dispatch({type: 'pause', payload: data});
    });
    
    socket.on('game-started', data => {
       store.dispatch({type: 'game-started', payload: data});
    });
    
    socket.on('four-game-started', data => {
       store.dispatch({type: 'four-game-started', payload: data});
    });
    
    socket.on('new-move', data => {
        store.dispatch({type: 'new-move', payload: data});
    });
    
    socket.on('four-new-move', data => {
        store.dispatch({type: 'four-new-move', payload: data});
    });
    
    socket.on('update-user', data => {
        store.dispatch({type: 'update-user', payload: data}); 
    });
    
    socket.on('action', data => {
        store.dispatch(data);
    });
    
    socket.on('duplicate-login', data => {
        store.dispatch({type: 'duplicate-login'})
    });
}

// let socketIoMiddleware = createSocketIoMiddleware(socket, ['server/']);

// export default socketIoMiddleware;
