"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMatchRoutes = setMatchRoutes;
const matchController_1 = require("../controllers/matchController");
const matchService_1 = require("../services/matchService");
function setMatchRoutes(app) {
    const matchService = new matchService_1.MatchService();
    const matchController = new matchController_1.MatchController(matchService);
    app.get('/api/matches', matchController.getAllMatches);
    app.get('/api/matches/:id', matchController.getMatchById);
    app.post('/api/matches', matchController.createMatch);
    app.put('/api/matches/:id', matchController.updateMatch);
    app.patch('/api/matches/:id', matchController.patchMatch);
    app.delete('/api/matches/:id', matchController.deleteMatch);
}
