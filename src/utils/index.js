export function mapObject(object, callback) {
    return Object.keys(object).map(function (key) {
    return callback(key, object[key]);
    });
}

export function generateTokenHeader() {
    return {
        headers: {
            "x-auth": localStorage.getItem('token')
        }
    };
}

export function millisToMinutesAndSeconds(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    if(seconds == 60) {
        minutes++;
        seconds = 0;
    }
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

export function formatTurn(turn) {
    switch (turn) {
        case 'w':
            return 'white';
        case 'b':
            return 'black';
        case 'g':
            return 'gold';
        case 'r':
            return 'red';
    }
}

export function showElo(game, time, player) {
    let ratings, tcIndex;
    //this time estimate is based on an estimated game length of 35 moves
    let totalTimeMs = (time.value * 60 * 1000) + (35 * time.increment * 1000);

    //Two player cutoff times
    let twoMins = 120000;   //two minutes in ms
    let eightMins = 480000;
    let fifteenMins = 900000;

    //four player cutoff times
    let fourMins = 240000;
    let twelveMins = 720000;
    let twentyMins = 12000000;

    switch(game.gameType) {
        case 'two-player':
            ratings = "standard_ratings";
            break;
        case 'crazyhouse':
            ratings = "crazyhouse_ratings";
            break;
        case 'crazyhouse960':
            ratings = "crazyhouse960_ratings";
            break;
        case 'four-player':
            ratings = 'fourplayer_ratings';
            break;
    }
    switch(game.gameType) {
        case 'two-player':
        case 'crazyhouse':
        case 'crazyhouse960':
            if( totalTimeMs <= twoMins) {
                //bullet
                tcIndex = 'bullet';
            } else if(totalTimeMs <= eightMins) {
                //blitz
                tcIndex = 'blitz';
            } else if(totalTimeMs <= fifteenMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return player[ratings][tcIndex];
        case 'four-player':
            if( totalTimeMs <= fourMins) {
                //bullet
                tcIndex = 'bullet';
            } else if(totalTimeMs <= twelveMins) {
                //blitz
                tcIndex = 'blitz';
            } else if(totalTimeMs <= twentyMins) {
                //rapid
                tcIndex = 'rapid';
            } else {
                //classical
                tcIndex = 'classic';
            }
            return player[ratings][tcIndex];
    }
}
