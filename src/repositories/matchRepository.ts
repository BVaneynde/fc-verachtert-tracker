import { MatchModel, IMatchDocument } from '../models/MatchModel';
import { Match } from '../models/Match';
import { Match as IMatch } from '../types';
import { isDatabaseConnected } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

export class MatchRepository {
    private dataFile: string = path.join(__dirname, '../../data/matches.json');

    async saveMatch(match: Match): Promise<void> {
        if (isDatabaseConnected()) {
            await this.saveToMongoDB(match);
        } else {
            this.saveToFile(match);
        }
    }

    async getAllMatches(): Promise<Match[]> {
        if (isDatabaseConnected()) {
            return await this.getFromMongoDB();
        } else {
            return this.getFromFile();
        }
    }

    async deleteMatch(id: number): Promise<void> {
        if (isDatabaseConnected()) {
            await MatchModel.deleteOne({ matchId: id });
        }
        // File handling happens in matchService
    }

    private async saveToMongoDB(match: Match): Promise<void> {
        try {
            await MatchModel.findOneAndUpdate(
                { matchId: match.id },
                {
                    matchId: match.id,
                    date: match.date,
                    opponent: match.opponent,
                    homeScore: match.homeScore,
                    awayScore: match.awayScore,
                    isHomeGame: match.isHomeGame,
                    scorers: match.scorers,
                    lineup: match.lineup,
                    notes: match.notes,
                    season: match.season,
                    isEvent: match.isEvent
                },
                { upsert: true, new: true }
            );
            console.log(`✅ Match ${match.id} saved to MongoDB`);
        } catch (error) {
            console.error('Error saving to MongoDB:', error);
            throw error;
        }
    }

    private async getFromMongoDB(): Promise<Match[]> {
        try {
            const docs = await MatchModel.find().sort({ date: -1 });
            return docs.map(doc => new Match(
                doc.matchId,
                doc.date,
                doc.opponent,
                doc.homeScore,
                doc.awayScore,
                doc.isHomeGame,
                doc.scorers || [],
                doc.lineup || [],
                doc.notes || '',
                doc.season,
                doc.isEvent
            ));
        } catch (error) {
            console.error('Error loading from MongoDB:', error);
            return [];
        }
    }

    private saveToFile(match: Match): void {
        // This is handled by matchService for now
    }

    private getFromFile(): Match[] {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf-8');
                const matchesData = JSON.parse(data);
                return matchesData.map((m: any) => new Match(
                    m.id,
                    m.date,
                    m.opponent,
                    m.homeScore,
                    m.awayScore,
                    m.isHomeGame,
                    m.scorers || [],
                    m.lineup || [],
                    m.notes || '',
                    m.season,
                    m.isEvent
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

        const fileMatches = this.getFromFile();
        if (fileMatches.length === 0) {
            console.log('No matches in file to migrate');
            return;
        }

        console.log(`Migrating ${fileMatches.length} matches to MongoDB...`);
        for (const match of fileMatches) {
            await this.saveToMongoDB(match);
        }
        console.log('✅ Migration complete!');
    }
}
