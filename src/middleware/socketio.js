import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

let socket = io('http://localhost:3000');

let socketIoMiddleware = createSocketIoMiddleware(socket, ['server/', 'disconnect']);

export default socketIoMiddleware;
