let url;
if (process.env.NODE_ENV === "production") {
    url = 'https://hellochess.com';
} else if (process.env.NODE_ENV === "staging") {
    url = 'https://hellochess-dev-johnnyvf24.c9users.io';
} else if(process.env.NODE_ENV === "dev2") {
    url = 'https://hellochess-johnnyvf24.c9users.io';
} else {
    url = 'http://localhost:3000';
}

export const ROOT_URL = url;
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const SELECTED_ROOM = 'SELECTED_ROOM';
export const UPDATE_USERNAME = 'UPDATE_USERNAME';
export const SELECTED_GAME_TYPE= 'SELECTED_GAME_TYPE';
export const SELECTED_TIME = 'SELECTED_TIME';
export const SELECTED_TIME_INCREMENT = 'SELECTED_TIME_INTERVAL';
export const CREATE_GAME_ROOM = 'CREATE_GAME_ROOM';
export const GAME_ROOM_NAME = 'GAME_ROOM_NAME';
export const ENABLE_VOICE_CHAT = 'ENABLE_VOICE_CHAT';
export const RESET_NEW_GAME_MODAL = 'RESET_NEW_GAME_MODAL';
export const SET_MAX_PLAYERS = 'SET_MAX_PLAYERS';
export const TOGGLE_PRIVATE = 'TOGGLE_PRIVATE';
export const VIEW_PROFILE = 'VIEW_PROFILE';
export const VIEW_LEADERBOARD = 'VIEW_LEADERBOARD';
export const RECENT_GAMES = 'RECENT_GAMES';
export const CLOSE_ANALYSIS = 'CLOSE_ANALYSIS';