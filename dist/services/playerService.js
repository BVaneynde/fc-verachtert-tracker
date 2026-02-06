"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = void 0;
const Player_1 = require("../models/Player");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PlayerService {
    constructor() {
        this.players = [];
        this.nextId = 1;
        this.dataFile = path.join(__dirname, '../../data/players.json');
        this.ensureDataDirectory();
        this.initializePlayers();
    }
    ensureDataDirectory() {
        const dataDir = path.dirname(this.dataFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }
    saveToFile() {
        try {
            console.log(`Saving ${this.players.length} players to: ${this.dataFile}`);
            const data = this.players.map(player => ({
                id: player.id,
                name: player.name,
                position: player.position,
                jerseyNumber: player.jerseyNumber
            }));
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
            console.log('Players saved successfully');
        }
        catch (error) {
            console.error('Error saving players to file:', error);
        }
    }
    loadFromFile() {
        try {
            console.log(`Looking for players file at: ${this.dataFile}`);
            if (fs.existsSync(this.dataFile)) {
                console.log('Players file exists, loading...');
                const data = fs.readFileSync(this.dataFile, 'utf-8');
                const playersData = JSON.parse(data);
                const players = playersData.map((p) => new Player_1.Player(p.id, p.name, p.position, p.jerseyNumber));
                console.log(`Loaded ${players.length} players from file`);
                return players;
            }
            else {
                console.log('Players file does not exist yet');
            }
        }
        catch (error) {
            console.error('Error loading players from file:', error);
        }
        return [];
    }
    initializePlayers() {
        // Laad opgeslagen spelers eerst
        const savedPlayers = this.loadFromFile();
        if (savedPlayers.length > 0) {
            // We hebben al spelers - gebruik die
            console.log(`Loading ${savedPlayers.length} players from file...`);
            this.players = savedPlayers;
            this.nextId = Math.max(...savedPlayers.map(p => p.id), 0) + 1;
        }
        else {
            // Eerste keer - voeg sample spelers toe
            console.log('First time initialization - adding sample players...');
            const samplePlayers = [
                { name: 'Jan Verachtert', position: 'Doelman', jerseyNumber: 1 },
                { name: 'Piet Claes', position: 'Verdediger', jerseyNumber: 2 },
                { name: 'Koen Janssens', position: 'Verdediger', jerseyNumber: 3 },
                { name: 'Tom Smeets', position: 'Middenvelder', jerseyNumber: 4 },
                { name: 'Bart Hendrickx', position: 'Middenvelder', jerseyNumber: 7 },
                { name: 'Luc De Vries', position: 'Aanvaller', jerseyNumber: 9 },
                { name: 'Mark Peeters', position: 'Aanvaller', jerseyNumber: 10 },
            ];
            samplePlayers.forEach(playerData => {
                this.createPlayer(playerData);
            });
        }
    }
    getAllPlayers() {
        return this.players;
    }
    getPlayerById(id) {
        return this.players.find(player => player.id === id);
    }
    createPlayer(playerData) {
        const newPlayer = new Player_1.Player(this.nextId++, playerData.name, playerData.position, playerData.jerseyNumber);
        this.players.push(newPlayer);
        this.saveToFile();
        return newPlayer;
    }
    updatePlayer(id, playerData) {
        const playerIndex = this.players.findIndex(player => player.id === id);
        if (playerIndex === -1)
            return undefined;
        this.players[playerIndex] = {
            ...this.players[playerIndex],
            ...playerData,
            id
        };
        this.saveToFile();
        return this.players[playerIndex];
    }
    deletePlayer(id) {
        const playerIndex = this.players.findIndex(player => player.id === id);
        if (playerIndex === -1)
            return false;
        this.players.splice(playerIndex, 1);
        this.saveToFile();
        return true;
    }
}
exports.PlayerService = PlayerService;
