"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
class MatchController {
    constructor(matchService) {
        this.matchService = matchService;
        this.getAllMatches = async (req, res) => {
            try {
                const matches = await this.matchService.getAllMatches();
                res.json(matches);
            }
            catch (error) {
                res.status(500).json({ message: 'Error fetching matches', error });
            }
        };
        this.getMatchById = (req, res) => {
            const id = parseInt(req.params.id);
            const match = this.matchService.getMatchById(id);
            if (!match) {
                res.status(404).json({ message: 'Match not found' });
                return;
            }
            res.json(match);
        };
        this.createMatch = (req, res) => {
            const match = this.matchService.createMatch(req.body);
            res.status(201).json(match);
        };
        this.updateMatch = (req, res) => {
            const id = parseInt(req.params.id);
            const match = this.matchService.updateMatch(id, req.body);
            if (!match) {
                res.status(404).json({ message: 'Match not found' });
                return;
            }
            res.json(match);
        };
        this.patchMatch = (req, res) => {
            const id = parseInt(req.params.id);
            const match = this.matchService.getMatchById(id);
            if (!match) {
                res.status(404).json({ message: 'Match not found' });
                return;
            }
            // Partial update - alleen isEvent updaten
            const updatedMatch = this.matchService.updateMatch(id, {
                ...match,
                ...req.body
            });
            res.json(updatedMatch);
        };
        this.deleteMatch = (req, res) => {
            const id = parseInt(req.params.id);
            const success = this.matchService.deleteMatch(id);
            if (!success) {
                res.status(404).json({ message: 'Match not found' });
                return;
            }
            res.status(204).send();
        };
    }
}
exports.MatchController = MatchController;
