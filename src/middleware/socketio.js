// import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

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
                socket.emit('update-user', action.payload.user);
                break;
            case 'server/join-room':
                socket.emit('join-room', action.payload);
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
}

// let socketIoMiddleware = createSocketIoMiddleware(socket, ['server/']);

// export default socketIoMiddleware;
