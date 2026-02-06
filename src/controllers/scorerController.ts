import { Request, Response } from 'express';
import { GoalScorer } from '../models/GoalScorer';
import { GoalScorerService } from '../services/scorerService';

export class ScorerController {
    private scorerService: GoalScorerService;

    constructor() {
        this.scorerService = new GoalScorerService();
    }

    public async getScorers(req: Request, res: Response): Promise<void> {
        try {
            const scorers = await this.scorerService.getAllScorers();
            res.status(200).json(scorers);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving scorers', error });
        }
    }

    public async addScorer(req: Request, res: Response): Promise<void> {
        try {
            const newScorer = new GoalScorer(req.body.playerId, req.body.matchId);
            const createdScorer = await this.scorerService.addScorer(newScorer);
            res.status(201).json(createdScorer);
        } catch (error) {
            res.status(500).json({ message: 'Error adding scorer', error });
        }
    }
}