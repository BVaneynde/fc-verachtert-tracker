"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = void 0;
class PlayerService {
    constructor() {
        this.players = [];
        // Initialize with some dummy data or fetch from a database
        this.players = this.fetchPlayers();
    }
    fetchPlayers() {
        // Logic to fetch players from a data source (e.g., database or API)
        return [
            { id: 1, name: "John Doe", position: "Forward", matchesPlayed: 10 },
            { id: 2, name: "Jane Smith", position: "Midfielder", matchesPlayed: 8 },
            // Add more players as needed
        ];
    }
    getPlayers() {
        return this.players;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    updatePlayer(updatedPlayer) {
        const index = this.players.findIndex(player => player.id === updatedPlayer.id);
        if (index !== -1) {
            this.players[index] = updatedPlayer;
        }
    }
}
exports.PlayerService = PlayerService;
