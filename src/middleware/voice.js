let webrtc = null, voice = false;

export function voiceMiddleware(store) {
    
    return next => action => {
        if(!webrtc && voice) {
            return;
        }
        const result = next(action);

        switch(action.type) {
            case 'voice/enable-voice': 
                let profile = store.getState().auth.profile;
                webrtc.joinRoom(action.payload);
                webrtc.startLocalVideo();
                return action;
            case 'voice/disable-voice':
                webrtc.leaveRoom(action.payload)
                webrtc.stopLocalVideo();
                return action;
            case 'server/join-room':
                break;
            case 'server/leave-room':
                webrtc.leaveRoom(action.payload);
                break;
        } 
     
        return result;
    }
}

export default function(store) {
    webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'video',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: 'remotesVideos',
        // wait for permission
        autoRequestMedia: false,
        media: {video: false, audio: true}
    });
    
    // we have to wait until it's ready
    webrtc.on('readyToCall', function () {
        // you can name it anything
        voice = true;
    });
}