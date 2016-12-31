export const SEND_MESSAGE = 'server/hello';

export function sendMessage() {
    return {
        type: SEND_MESSAGE,
        payload: request
    };
};
