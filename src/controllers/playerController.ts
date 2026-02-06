import { Request, Response } from 'express';
import { PlayerService } from '../services/playerService';

export class PlayerController {
    constructor(private playerService: PlayerService) {}

    getAllPlayers = (req: Request, res: Response): void => {
        const players = this.playerService.getAllPlayers();
        res.json(players);
    };

    getPlayerById = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id);
        const player = this.playerService.getPlayerById(id);
        
        if (!player) {
            res.status(404).json({ message: 'Player not found' });
            return;
        }
        
        res.json(player);
    };

    createPlayer = (req: Request, res: Response): void => {
        const player = this.playerService.createPlayer(req.body);
        res.status(201).json(player);
    };

    updatePlayer = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id);
        const player = this.playerService.updatePlayer(id, req.body);
        
        if (!player) {
            res.status(404).json({ message: 'Player not found' });
            return;
        }
        
        res.json(player);
    };

    deletePlayer = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id);
        const success = this.playerService.deletePlayer(id);
        
        if (!success) {
            res.status(404).json({ message: 'Player not found' });
            return;
        }
        
        res.status(204).send();
    };
}