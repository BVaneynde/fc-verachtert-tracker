"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerController = void 0;
class PlayerController {
    constructor(playerService) {
        this.playerService = playerService;
        this.getAllPlayers = (req, res) => {
            const players = this.playerService.getAllPlayers();
            res.json(players);
        };
        this.getPlayerById = (req, res) => {
            const id = parseInt(req.params.id);
            const player = this.playerService.getPlayerById(id);
            if (!player) {
                res.status(404).json({ message: 'Player not found' });
                return;
            }
            res.json(player);
        };
        this.createPlayer = (req, res) => {
            const player = this.playerService.createPlayer(req.body);
            res.status(201).json(player);
        };
        this.updatePlayer = (req, res) => {
            const id = parseInt(req.params.id);
            const player = this.playerService.updatePlayer(id, req.body);
            if (!player) {
                res.status(404).json({ message: 'Player not found' });
                return;
            }
            res.json(player);
        };
        this.deletePlayer = (req, res) => {
            const id = parseInt(req.params.id);
            const success = this.playerService.deletePlayer(id);
            if (!success) {
                res.status(404).json({ message: 'Player not found' });
                return;
            }
            res.status(204).send();
        };
    }
}
exports.PlayerController = PlayerController;
