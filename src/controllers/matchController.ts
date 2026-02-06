import { Request, Response } from 'express';
import { MatchService } from '../services/matchService';

export class MatchController {
    constructor(private matchService: MatchService) {}

    getAllMatches = async (req: Request, res: Response): Promise<void> => {
        try {
            const matches = await this.matchService.getAllMatches();
            res.json(matches);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching matches', error });
        }
    };

    getMatchById = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id);
        const match = this.matchService.getMatchById(id);
        
        if (!match) {
            res.status(404).json({ message: 'Match not found' });
            return;
        }
        
        res.json(match);
    };

    createMatch = (req: Request, res: Response): void => {
        const match = this.matchService.createMatch(req.body);
        res.status(201).json(match);
    };

    updateMatch = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id);
        const match = this.matchService.updateMatch(id, req.body);
        
        if (!match) {
            res.status(404).json({ message: 'Match not found' });
            return;
        }
        
        res.json(match);
    };

    patchMatch = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id);
        const match = this.matchService.getMatchById(id);
        
        if (!match) {
            res.status(404).json({ message: 'Match not found' });
            return;
        }
        
        // Partial update - alleen isEvent updaten
        const updatedMatch = this.matchService.updateMatch(id, {
            ...match,
            ...req.body
        });
        
        res.json(updatedMatch);
    };

    deleteMatch = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id);
        const success = this.matchService.deleteMatch(id);
        
        if (!success) {
            res.status(404).json({ message: 'Match not found' });
            return;
        }
        
        res.status(204).send();
    };
}