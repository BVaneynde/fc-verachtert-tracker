"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScorerController = void 0;
const GoalScorer_1 = require("../models/GoalScorer");
const scorerService_1 = require("../services/scorerService");
class ScorerController {
    constructor() {
        this.scorerService = new scorerService_1.GoalScorerService();
    }
    async getScorers(req, res) {
        try {
            const scorers = await this.scorerService.getAllScorers();
            res.status(200).json(scorers);
        }
        catch (error) {
            res.status(500).json({ message: 'Error retrieving scorers', error });
        }
    }
    async addScorer(req, res) {
        try {
            const newScorer = new GoalScorer_1.GoalScorer(req.body.playerId, req.body.matchId);
            const createdScorer = await this.scorerService.addScorer(newScorer);
            res.status(201).json(createdScorer);
        }
        catch (error) {
            res.status(500).json({ message: 'Error adding scorer', error });
        }
    }
}
exports.ScorerController = ScorerController;
