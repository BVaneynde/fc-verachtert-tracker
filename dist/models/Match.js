"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = void 0;
class Match {
    constructor(id, date, opponent, homeScore, awayScore, isHomeGame, scorers, lineup, notes, season, isEvent) {
        this.id = id;
        this.date = date;
        this.opponent = opponent;
        this.homeScore = homeScore;
        this.awayScore = awayScore;
        this.isHomeGame = isHomeGame;
        this.scorers = scorers;
        this.lineup = lineup;
        this.notes = notes;
        this.season = season;
        this.isEvent = isEvent;
    }
}
exports.Match = Match;
