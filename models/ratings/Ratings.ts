export default class Ratings {
    constructor(
        private _classical: number,
        private _rapid: number,
        private _blitz: number,
        private _bullet: number
    ) { }
    
    get classical() { return this._classical; }
    get rapid() { return this._rapid; }
    get blitz() { return this._blitz; }
    get bullet () { return this._bullet; }
    
    set classical(classical: number) { this._classical = classical; }
    set rapid(rapid: number) { this._rapid = rapid; }
    set blitz(blitz: number) { this._blitz = blitz; }
    set bullet (bullet: number) { this._bullet = bullet; }
    
}