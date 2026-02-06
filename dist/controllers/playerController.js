"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerController = void 0;
const playerService_1 = require("../services/playerService");
class PlayerController {
    constructor() {
        this.playerService = new playerService_1.PlayerService();
    }
    getPlayers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const players = yield this.playerService.getPlayers();
                res.status(200).json(players);
            }
            catch (error) {
                res.status(500).json({ message: 'Error retrieving players' });
            }
        });
    }
    addPlayer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newPlayer = yield this.playerService.addPlayer(req.body);
                res.status(201).json(newPlayer);
            }
            catch (error) {
                res.status(500).json({ message: 'Error adding player' });
            }
        });
    }
    updatePlayer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedPlayer = yield this.playerService.updatePlayer(req.params.id, req.body);
                res.status(200).json(updatedPlayer);
            }
            catch (error) {
                res.status(500).json({ message: 'Error updating player' });
            }
        });
    }
}
exports.PlayerController = PlayerController;
