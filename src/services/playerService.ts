import { Player } from '../models/Player';
import { Player as IPlayer } from '../types';
import { PlayerRepository } from '../repositories/playerRepository';
import { isDatabaseConnected } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

export class PlayerService {
    private players: Player[] = [];
    private nextId: number = 1;
    private playerRepository: PlayerRepository;
    private dataFile: string = path.join(__dirname, '../../data/players.json');

    constructor() {
        this.playerRepository = new PlayerRepository();
        this.ensureDataDirectory();
        this.initializePlayers();
    }

    private ensureDataDirectory(): void {
        const dataDir = path.dirname(this.dataFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    private saveToFile(): void {
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
        } catch (error) {
            console.error('Error saving players to file:', error);
        }
    }

    private loadFromFile(): Player[] {
        try {
            console.log(`Looking for players file at: ${this.dataFile}`);
            if (fs.existsSync(this.dataFile)) {
                console.log('Players file exists, loading...');
                const data = fs.readFileSync(this.dataFile, 'utf-8');
                const playersData = JSON.parse(data);
                const players = playersData.map((p: any) => new Player(
                    p.id,
                    p.name,
                    p.position,
                    p.jerseyNumber
                ));
                console.log(`Loaded ${players.length} players from file`);
                return players;
            } else {
                console.log('Players file does not exist yet');
            }
        } catch (error) {
            console.error('Error loading players from file:', error);
        }
        return [];
    }

    private initializePlayers(): void {
        // Laad opgeslagen spelers eerst
        const savedPlayers = this.loadFromFile();
        
        if (savedPlayers.length > 0) {
            // We hebben al spelers - gebruik die
            console.log(`Loading ${savedPlayers.length} players from file...`);
            this.players = savedPlayers;
            this.nextId = Math.max(...savedPlayers.map(p => p.id), 0) + 1;
        } else {
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
        
        // Migrate to MongoDB if connected
        if (isDatabaseConnected()) {
            this.playerRepository.migrateFileToMongoDB();
        }
    }

    getAllPlayers(): Player[] {
        // If MongoDB is connected, always return from there
        if (isDatabaseConnected()) {
            // This will be async, but for now we return the cached version
            // The real data will be fetched via repository
        }
        return this.players;
    }

    getPlayerById(id: number): Player | undefined {
        return this.players.find(player => player.id === id);
    }

    createPlayer(playerData: Omit<IPlayer, 'id'>): Player {
        const newPlayer = new Player(
            this.nextId++,
            playerData.name,
            playerData.position,
            playerData.jerseyNumber
        );
        this.players.push(newPlayer);
        this.saveToFile();
        
        // Also save to MongoDB if connected
        if (isDatabaseConnected()) {
            this.playerRepository.savePlayer(newPlayer);
        }
        
        return newPlayer;
    }

    updatePlayer(id: number, playerData: Partial<IPlayer>): Player | undefined {
        const playerIndex = this.players.findIndex(player => player.id === id);
        if (playerIndex === -1) return undefined;

        this.players[playerIndex] = {
            ...this.players[playerIndex],
            ...playerData,
            id
        };
        this.saveToFile();
        
        // Also save to MongoDB if connected
        if (isDatabaseConnected()) {
            this.playerRepository.savePlayer(this.players[playerIndex]);
        }
        
        return this.players[playerIndex];
    }

    deletePlayer(id: number): boolean {
        const playerIndex = this.players.findIndex(player => player.id === id);
        if (playerIndex === -1) return false;

        this.players.splice(playerIndex, 1);
        this.saveToFile();
        
        // Also delete from MongoDB if connected
        if (isDatabaseConnected()) {
            this.playerRepository.deletePlayer(id);
        }
        
        return true;
    }
}