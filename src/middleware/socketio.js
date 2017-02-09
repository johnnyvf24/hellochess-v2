import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';

export const socket = io('https://www.hellochess.com');

let socketIoMiddleware = createSocketIoMiddleware(socket, ['server/']);

export default socketIoMiddleware;
