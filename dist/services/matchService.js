"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchService = void 0;
class MatchService {
    constructor() {
        this.matches = []; // This will hold match data
        // Initialize with some dummy data or fetch from a database
        this.matches = [];
    }
    getMatches() {
        return this.matches;
    }
    addMatch(match) {
        this.matches.push(match);
    }
    updateMatch(matchId, updatedMatch) {
        const index = this.matches.findIndex(match => match.id === matchId);
        if (index !== -1) {
            this.matches[index] = Object.assign(Object.assign({}, this.matches[index]), updatedMatch);
        }
    }
    getMatchById(matchId) {
        return this.matches.find(match => match.id === matchId);
    }
}
exports.MatchService = MatchService;
