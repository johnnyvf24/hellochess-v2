import Player from '../players/Player';

export class Message {
    protected picture: string;
    protected username: string;
    protected playerId: string;
    protected eventType: string = 'chat-message';
    protected timeSent = new Date();
    protected anonymous: boolean = false;
    
    constructor(player: Player, 
                protected messageBody: string,
                protected roomName: string) {
        if (player) {
            this.picture = player.picture;
            this.username = player.username;
            this.playerId = player.playerId;
            this.anonymous = player.anonymous;
        }
    }
    
    getMessage() {
        return {
            user: this.username,
            msg: this.messageBody,
            picture: this.picture,
            event_type: this.eventType,
            time: this.timeSent,
            playerId: this.playerId,
            anonymous: this.anonymous
        };
    }
}

export class JoinMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `${this.username} has joined the room.`;
            this.eventType = 'user-joined';
        }
}

export class LeaveMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `${this.username} has left the room.`;
            this.eventType = 'user-left';
        }
}

export class ResignMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `${this.username} has resigned.`;
            this.eventType = 'player-resigned';
        }
}

export class CheckmateMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `${this.username} was checkmated.`;
            this.eventType = 'player-checkmated';
        }
}

export class TimeForfeitMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `${this.username} forfeits on time.`;
            this.eventType = 'player-time-forfeit';
        }
}

export class WinnerMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `${this.username} is the winner!`;
            this.eventType = 'player-winner';
        }
}

export class DrawMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `The game ended in a draw.`;
            this.eventType = 'game-draw';
        }
}

export class DrawOfferMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `${this.username} offered a draw.`;
            this.eventType = 'draw-offer';
        }
}

export class EliminationMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `${this.username} has been eliminated.`;
            this.eventType = 'player-eliminated';
        }
}

export class AbortMessage extends Message {
    constructor(player: Player,
                messageBody: string,
                roomName: string) {
            super(player, messageBody, roomName);
            this.messageBody = `${this.username} aborted the game.`;
            this.eventType = 'game-aborted';
        }
}

export class GameStartedMessage extends Message {
    constructor(players: Player[],
                messageBody: string,
                roomName: string) {
            super(null, messageBody, roomName);
            this.messageBody =
                `The game has begun: ${players.map(p => p.username).join(' vs. ')}`;
            this.eventType = 'game-started';
        }
}