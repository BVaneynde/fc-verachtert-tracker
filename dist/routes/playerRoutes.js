"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPlayerRoutes = void 0;
const express_1 = require("express");
const playerController_1 = __importDefault(require("../controllers/playerController"));
const router = (0, express_1.Router)();
const playerController = new playerController_1.default();
function setPlayerRoutes(app) {
    app.use('/api/players', router);
    router.get('/', playerController.getPlayers.bind(playerController));
    router.post('/', playerController.addPlayer.bind(playerController));
    router.put('/:id', playerController.updatePlayer.bind(playerController));
}
exports.setPlayerRoutes = setPlayerRoutes;
