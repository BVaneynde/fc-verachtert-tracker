"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMatchRoutes = void 0;
const express_1 = require("express");
const matchController_1 = __importDefault(require("../controllers/matchController"));
const router = (0, express_1.Router)();
const matchController = new matchController_1.default();
function setMatchRoutes(app) {
    app.use('/api/matches', router);
    router.get('/', matchController.getMatches.bind(matchController));
    router.post('/', matchController.addMatch.bind(matchController));
    router.put('/:id', matchController.updateMatch.bind(matchController));
}
exports.setMatchRoutes = setMatchRoutes;
