// import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

let socket = null;

export function socketIoMiddleware(store) {
    
    return next => action => {
        const result = next(action);
        if(!socket) {
            return;
        }
        
       if (socket && action.type === 'server/connected-user') {
            let profile = store.getState().auth.profile;
            socket.emit('connected-user', profile);
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
        console.log(data); 
    });
}

// let socketIoMiddleware = createSocketIoMiddleware(socket, ['server/']);

// export default socketIoMiddleware;
