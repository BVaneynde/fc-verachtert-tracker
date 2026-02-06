import { Application } from 'express';
import { PlayerController } from '../controllers/playerController';
import { PlayerService } from '../services/playerService';

export function setPlayerRoutes(app: Application): void {
    const playerService = new PlayerService();
    const playerController = new PlayerController(playerService);

    app.get('/api/players', playerController.getAllPlayers);
    app.get('/api/players/:id', playerController.getPlayerById);
    app.post('/api/players', playerController.createPlayer);
    app.put('/api/players/:id', playerController.updatePlayer);
    app.delete('/api/players/:id', playerController.deletePlayer);
}