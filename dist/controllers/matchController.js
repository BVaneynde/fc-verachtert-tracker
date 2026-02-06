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
class MatchController {
    constructor(matchService) {
        this.matchService = matchService;
    }
    getMatches(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const matches = yield this.matchService.getAllMatches();
                res.status(200).json(matches);
            }
            catch (error) {
                res.status(500).json({ message: 'Error retrieving matches', error });
            }
        });
    }
    addMatch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newMatch = yield this.matchService.createMatch(req.body);
                res.status(201).json(newMatch);
            }
            catch (error) {
                res.status(400).json({ message: 'Error adding match', error });
            }
        });
    }
    updateMatch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedMatch = yield this.matchService.updateMatch(req.params.id, req.body);
                res.status(200).json(updatedMatch);
            }
            catch (error) {
                res.status(400).json({ message: 'Error updating match', error });
            }
        });
    }
}
exports.default = MatchController;
