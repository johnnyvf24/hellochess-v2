import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

let s;

if (process.env.NODE_ENV === "production") {
    s = io('https://www.hellochess.com');
} else if (process.env.NODE_ENV === "staging") {
    s = io('https://hellochess-dev-johnnyvf24.c9users.io');
} else {
    s = io('http://localhost:3000');
}

export const socket = s;

let socketIoMiddleware = createSocketIoMiddleware(socket, ['server/']);

export default socketIoMiddleware;
