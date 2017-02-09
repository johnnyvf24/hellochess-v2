import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

export let socket = io('http://localhost:3000');

if (process.env.NODE_ENV === "production") {
    socket = io('https://www.hellochess.com');
}

let socketIoMiddleware = createSocketIoMiddleware(socket, ['server/']);

export default socketIoMiddleware;
