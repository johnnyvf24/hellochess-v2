
export default class Clock {
    constructor(baseTime, increment) {
        if (typeof baseTime !== "undefined")
            this.baseTime = baseTime;
        if (typeof increment !== "undefined")
            this.increment = increment;
        this.duration = baseTime;
        this.granularity = 1000;
        this.running = false;
        this.timer = null;
        this.startTime = null;
        this.tickCallbacks = [];
        this.timeUpCallbacks = [];
    }
    
    start(duration) {
        if (this.running) {
            return;
        }
        if (typeof duration !== "undefined") {
            this.duration = duration;
        }
        this.running = true;
        this.startTime = Date.now();
        let diff, timeString;
        let that = this;
        (function timer() {
            diff = that.duration - (Date.now() - that.startTime);
            if (diff > 0) {
                if (diff < 10) {
                    that.timeUpCallbacks.forEach(function(callback) {
                        callback.call(this, diff);
                    }, that);
                    that.pause();
                    return;
                }
                if (diff <= 5000) {
                    that.granularity = 10;
                } else if (diff <= 11000) {
                    that.granularity = 100;
                } else {
                    that.granularity = 1000;
                }
                that.timer = setTimeout(timer, that.granularity);
            } else {
                diff = 0;
                that.running = false;
            }
            that.tickCallbacks.forEach(function(callback) {
              callback.call(this, diff);
            }, that);
        }());
    }
    
    onTick(callback) {
        if (typeof callback === 'function') {
            this.tickCallbacks.push(callback);
        }
        return this;
    }
    
    onTimeUp(callback) {
        if (typeof callback === "function") {
            this.timeUpCallbacks.push(callback);
        }
        return this;
    }
    
    pause() {
        if (!this.running) {
            return;
        }
        this.running = false;
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = null;
        this.duration -= Date.now() - this.startTime;
    }
    
    parse(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000);
        if(seconds.toFixed(0) == 60) {
            minutes++;
            seconds = 0;
        }
        minutes = Math.max(0, minutes);
        seconds = Math.max(0, seconds);
        if (millis < 10000) {
            seconds = seconds.toFixed(1);
        } else {
            seconds = seconds.toFixed(0);
        }
        let timeString = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        return timeString;
    }
}