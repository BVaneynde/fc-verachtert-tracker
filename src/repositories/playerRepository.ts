import { PlayerModel, IPlayerDocument } from '../models/PlayerModel';
import { Player } from '../models/Player';
import { Player as IPlayer } from '../types';
import { isDatabaseConnected } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

export class PlayerRepository {
    private dataFile: string = path.join(__dirname, '../../data/players.json');

    async savePlayer(player: Player): Promise<void> {
        if (isDatabaseConnected()) {
            await this.saveToMongoDB(player);
        }
    }

    async getAllPlayers(): Promise<Player[]> {
        if (isDatabaseConnected()) {
            return await this.getFromMongoDB();
        } else {
            return this.getFromFile();
        }
    }

    async deletePlayer(id: number): Promise<void> {
        if (isDatabaseConnected()) {
            await PlayerModel.deleteOne({ playerId: id });
        }
    }

    private async saveToMongoDB(player: Player): Promise<void> {
        try {
            await PlayerModel.findOneAndUpdate(
                { playerId: player.id },
                {
                    playerId: player.id,
                    name: player.name,
                    position: player.position,
                    jerseyNumber: player.jerseyNumber
                },
                { upsert: true, new: true }
            );
            console.log(`✅ Player ${player.id} saved to MongoDB`);
        } catch (error) {
            console.error('Error saving to MongoDB:', error);
            throw error;
        }
    }

    private async getFromMongoDB(): Promise<Player[]> {
        try {
            const docs = await PlayerModel.find().sort({ jerseyNumber: 1 });
            return docs.map(doc => new Player(
                doc.playerId,
                doc.name,
                doc.position,
                doc.jerseyNumber
            ));
        } catch (error) {
            console.error('Error loading from MongoDB:', error);
            return [];
        }
    }

    private getFromFile(): Player[] {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf-8');
                const playersData = JSON.parse(data);
                return playersData.map((p: any) => new Player(
                    p.id,
                    p.name,
                    p.position,
                    p.jerseyNumber
                ));
            }
        } catch (error) {
            console.error('Error loading from file:', error);
        }
        return [];
    }

    async migrateFileToMongoDB(): Promise<void> {
        if (!isDatabaseConnected()) {
            console.log('MongoDB not connected, skipping migration');
            return;
        }

        const filePlayers = this.getFromFile();
        if (filePlayers.length === 0) {
            console.log('No players in file to migrate');
            return;
        }

        console.log(`Migrating ${filePlayers.length} players to MongoDB...`);
        for (const player of filePlayers) {
            await this.saveToMongoDB(player);
        }
        console.log('✅ Player migration complete!');
    }
}
