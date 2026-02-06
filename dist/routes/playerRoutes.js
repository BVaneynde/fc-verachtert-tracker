"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPlayerRoutes = setPlayerRoutes;
const playerController_1 = require("../controllers/playerController");
const playerService_1 = require("../services/playerService");
function setPlayerRoutes(app) {
    const playerService = new playerService_1.PlayerService();
    const playerController = new playerController_1.PlayerController(playerService);
    app.get('/api/players', playerController.getAllPlayers);
    app.get('/api/players/:id', playerController.getPlayerById);
    app.post('/api/players', playerController.createPlayer);
    app.put('/api/players/:id', playerController.updatePlayer);
    app.delete('/api/players/:id', playerController.deletePlayer);
}
