"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalScorer = void 0;
class GoalScorer {
    constructor(id, matchId, playerId, goals) {
        this.id = id;
        this.matchId = matchId;
        this.playerId = playerId;
        this.goals = goals;
    }
}
exports.GoalScorer = GoalScorer;
