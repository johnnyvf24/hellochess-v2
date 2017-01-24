import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

export const socket = io('http://localhost:3000');

let socketIoMiddleware = createSocketIoMiddleware(socket, ['server/']);

export default socketIoMiddleware;
