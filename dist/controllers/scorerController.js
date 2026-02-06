"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScorerController = void 0;
const GoalScorer_1 = require("../models/GoalScorer");
const scorerService_1 = require("../services/scorerService");
class ScorerController {
    constructor() {
        this.scorerService = new scorerService_1.GoalScorerService();
    }
    getScorers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scorers = yield this.scorerService.getAllScorers();
                res.status(200).json(scorers);
            }
            catch (error) {
                res.status(500).json({ message: 'Error retrieving scorers', error });
            }
        });
    }
    addScorer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newScorer = new GoalScorer_1.GoalScorer(req.body.playerId, req.body.matchId);
                const createdScorer = yield this.scorerService.addScorer(newScorer);
                res.status(201).json(createdScorer);
            }
            catch (error) {
                res.status(500).json({ message: 'Error adding scorer', error });
            }
        });
    }
}
exports.ScorerController = ScorerController;
