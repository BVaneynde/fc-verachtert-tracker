import { Application } from 'express';
import { MatchController } from '../controllers/matchController';
import { MatchService } from '../services/matchService';

export function setMatchRoutes(app: Application): void {
    const matchService = new MatchService();
    const matchController = new MatchController(matchService);

    app.get('/api/matches', matchController.getAllMatches);
    app.get('/api/matches/:id', matchController.getMatchById);
    app.post('/api/matches', matchController.createMatch);
    app.put('/api/matches/:id', matchController.updateMatch);
    app.patch('/api/matches/:id', matchController.patchMatch);
    app.delete('/api/matches/:id', matchController.deleteMatch);
}