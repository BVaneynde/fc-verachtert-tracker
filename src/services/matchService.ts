import { Match } from '../models/Match';
import { Match as IMatch } from '../types';
import { ScraperService } from './scraperService';
import * as fs from 'fs';
import * as path from 'path';

export class MatchService {
    private matches: Match[] = [];
    private nextId: number = 1;
    private scraperService: ScraperService;
    private isInitialized: boolean = false;
    private dataFile: string = path.join(__dirname, '../../data/matches.json');

    constructor() {
        this.scraperService = new ScraperService();
        this.ensureDataDirectory();
        this.initializeMatches();
    }

    private ensureDataDirectory(): void {
        const dataDir = path.dirname(this.dataFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    private saveToFile(): void {
        try {
            console.log(`Saving ${this.matches.length} matches to: ${this.dataFile}`);
            const data = this.matches.map(match => ({
                id: match.id,
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
            }));
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
            console.log('Matches saved successfully');
        } catch (error) {
            console.error('Error saving matches to file:', error);
        }
    }

    private loadFromFile(): Match[] {
        try {
            console.log(`Looking for matches file at: ${this.dataFile}`);
            if (fs.existsSync(this.dataFile)) {
                console.log('File exists, loading...');
                const data = fs.readFileSync(this.dataFile, 'utf-8');
                const matchesData = JSON.parse(data);
                const matches = matchesData.map((m: any) => new Match(
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
                console.log(`Loaded ${matches.length} matches from file`);
                return matches;
            } else {
                console.log('File does not exist yet');
            }
        } catch (error) {
            console.error('Error loading matches from file:', error);
        }
        return [];
    }

    private async initializeMatches(): Promise<void> {
        if (this.isInitialized) return;
        
        try {
            // Laad opgeslagen data eerst
            const savedMatches = this.loadFromFile();
            
            if (savedMatches.length > 0) {
                // We hebben al data - gebruik die
                console.log(`Loading ${savedMatches.length} matches from file...`);
                this.matches = savedMatches;
                this.nextId = Math.max(...savedMatches.map(m => m.id), 0) + 1;
                
                // Sync met calendar om nieuwe wedstrijden toe te voegen
                console.log('Syncing with calendar for new matches...');
                const scrapedMatches = await this.scraperService.scrapeMatches();
                const existingKeys = new Set(this.matches.map(m => m.date + '|' + m.opponent));
                
                let newCount = 0;
                scrapedMatches.forEach(matchData => {
                    const key = matchData.date + '|' + matchData.opponent;
                    if (!existingKeys.has(key)) {
                        const newMatch = new Match(
                            this.nextId++,
                            matchData.date,
                            matchData.opponent,
                            matchData.homeScore,
                            matchData.awayScore,
                            matchData.isHomeGame,
                            matchData.scorers || [],
                            matchData.lineup || [],
                            matchData.notes || '',
                            matchData.season,
                            matchData.isEvent
                        );
                        this.matches.push(newMatch);
                        newCount++;
                    }
                });
                
                if (newCount > 0) {
                    console.log(`Added ${newCount} new matches from calendar`);
                    this.saveToFile();
                }
            } else {
                // Eerste keer - haal alles op van calendar
                console.log('First time initialization - fetching all matches from calendar...');
                const scrapedMatches = await this.scraperService.scrapeMatches();
                
                scrapedMatches.forEach(matchData => {
                    const newMatch = new Match(
                        this.nextId++,
                        matchData.date,
                        matchData.opponent,
                        matchData.homeScore,
                        matchData.awayScore,
                        matchData.isHomeGame,
                        matchData.scorers || [],
                        matchData.lineup || [],
                        matchData.notes || '',
                        matchData.season,
                        matchData.isEvent
                    );
                    this.matches.push(newMatch);
                });
                
                console.log(`Loaded ${this.matches.length} matches from calendar`);
                this.saveToFile();
            }
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing matches:', error);
            this.isInitialized = true;
        }
    }

    async getAllMatches(): Promise<Match[]> {
        if (!this.isInitialized) {
            await this.initializeMatches();
        }
        return this.matches;
    }

    getMatchById(id: number): Match | undefined {
        return this.matches.find(match => match.id === id);
    }

    createMatch(matchData: Omit<IMatch, 'id'>): Match {
        const newMatch = new Match(
            this.nextId++,
            matchData.date,
            matchData.opponent,
            matchData.homeScore,
            matchData.awayScore,
            matchData.isHomeGame,
            matchData.scorers || [],
            matchData.lineup || [],
            matchData.notes || ''
        );
        this.matches.push(newMatch);
        this.saveToFile();
        return newMatch;
    }

    updateMatch(id: number, matchData: Partial<IMatch>): Match | undefined {
        const matchIndex = this.matches.findIndex(match => match.id === id);
        if (matchIndex === -1) return undefined;

        const existingMatch = this.matches[matchIndex];
        this.matches[matchIndex] = new Match(
            existingMatch.id,
            matchData.date ?? existingMatch.date,
            matchData.opponent ?? existingMatch.opponent,
            matchData.homeScore ?? existingMatch.homeScore,
            matchData.awayScore ?? existingMatch.awayScore,
            matchData.isHomeGame ?? existingMatch.isHomeGame,
            matchData.scorers ?? existingMatch.scorers,
            matchData.lineup ?? existingMatch.lineup,
            matchData.notes ?? existingMatch.notes,
            matchData.season ?? existingMatch.season,
            matchData.isEvent ?? existingMatch.isEvent
        );
        this.saveToFile();
        return this.matches[matchIndex];
    }

    deleteMatch(id: number): boolean {
        const matchIndex = this.matches.findIndex(match => match.id === id);
        if (matchIndex === -1) return false;

        this.matches.splice(matchIndex, 1);
        this.saveToFile();
        return true;
    }
}