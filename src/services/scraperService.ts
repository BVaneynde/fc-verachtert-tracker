import axios from 'axios';
import * as cheerio from 'cheerio';
import * as ical from 'ical';
import { Match } from '../models/Match';
import { Match as IMatch } from '../types';

export class ScraperService {
    private readonly calendarUrl = 'https://fcverachtert.jouwweb.be/kalender';
    private readonly icalUrl = 'https://calendar.google.com/calendar/ical/fcverachtert%40gmail.com/public/basic.ics';
    
    async scrapeMatches(): Promise<Omit<IMatch, 'id'>[]> {
        try {
            console.log('Fetching calendar via iCal feed...');
            
            // Probeer eerst iCal feed op te halen
            const icalMatches = await this.fetchFromICalFeed();
            if (icalMatches.length > 0) {
                console.log(`Successfully loaded ${icalMatches.length} matches from Google Calendar`);
                return icalMatches;
            }
            
            // Als Google Calendar faalt, probeer de website te scrapen
            const response = await axios.get(this.calendarUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const $ = cheerio.load(response.data);
            
            // Zoek naar Google Calendar iframe
            const calendarIframe = $('iframe[src*="google.com/calendar"]');
            if (calendarIframe.length > 0) {
                const iframeSrc = calendarIframe.attr('src');
                console.log('Found Google Calendar iframe:', iframeSrc);
                
                // Probeer calendar ID te extraheren
                const calendarIdMatch = iframeSrc?.match(/src=([^&]+)/);
                if (calendarIdMatch) {
                    const calendarId = decodeURIComponent(calendarIdMatch[1]);
                    console.log('Calendar ID:', calendarId);
                }
            }
            
            console.log('Using mock data for now...');
            return this.getMockMatches();
            
        } catch (error) {
            console.error('Error scraping matches:', error);
            return this.getMockMatches();
        }
    }
    
    private async fetchFromICalFeed(): Promise<Omit<IMatch, 'id'>[]> {
        try {
            // Haal de iCal feed op
            const response = await axios.get(this.icalUrl, {
                responseType: 'text',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            // Parse de iCal data
            const calendarData = ical.parseICS(response.data);
            const matches: Omit<IMatch, 'id'>[] = [];
            
            // Haal huidige datum op en bereken datumbereik
            const now = new Date();
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
            
            for (const [key, event] of Object.entries(calendarData)) {
                if (event.type === 'VEVENT') {
                    const eventDate = event.start;
                    
                    // Filter: laatste jaar + volgende 3 maanden
                    if (eventDate && eventDate >= oneYearAgo && eventDate <= threeMonthsAhead) {
                        const match = this.parseICalEvent(event);
                        if (match) {
                            matches.push(match);
                        }
                    }
                }
            }
            
            // Sorteer matches op datum (nieuwste eerst)
            matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            return matches;
        } catch (error) {
            console.error('Error fetching from iCal feed:', error);
            return [];
        }
    }
    
    private parseICalEvent(event: any): Omit<IMatch, 'id'> | null {
        try {
            const summary = event.summary || '';
            const description = event.description || '';
            const startDate = event.start;
            
            if (!startDate) return null;
            
            // Parse datum naar YYYY-MM-DD formaat
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const day = String(startDate.getDate()).padStart(2, '0');
            const date = `${year}-${month}-${day}`;
            
            // Log de eerste paar events om te zien wat er binnenkomt
            if (Math.random() < 0.05) { // Log ~5% van events
                console.log('Calendar event:', { summary, description, date });
            }
            
            // Bepaal seizoen (augustus t/m juli)
            const eventMonth = startDate.getMonth() + 1; // 1-12
            const seasonStartYear = eventMonth >= 8 ? year : year - 1;
            const seasonEndYear = seasonStartYear + 1;
            const season = `${seasonStartYear}-${seasonEndYear}`;
            
            // Check of het een evenement is (BBQ, teambuilding, etc)
            const eventKeywords = ['bbq', 'barbecue', 'teambuilding', 'feest', 'party', 'activiteit'];
            const isEvent = eventKeywords.some(keyword => 
                summary.toLowerCase().includes(keyword)
            );
            
            // Gebruik de exacte titel uit de kalender - neem deze volledig over
            let opponent = summary.trim();
            let isHomeGame = true;
            
            // Bepaal of het thuis of uit is op basis van de volgorde in de titel
            if (summary.includes(' - ')) {
                const parts = summary.split(' - ');
                const firstTeam = parts[0].toLowerCase();
                const secondTeam = parts[1].toLowerCase();
                
                if (firstTeam.includes('fcv') || firstTeam.includes('verachtert')) {
                    isHomeGame = true;
                } else if (secondTeam.includes('fcv') || secondTeam.includes('verachtert')) {
                    isHomeGame = false;
                }
            }
            
            // Maak een wedstrijd object aan met initiële score 0-0
            return {
                date,
                opponent,
                homeScore: 0,
                awayScore: 0,
                isHomeGame,
                scorers: [],
                lineup: [],
                notes: description || '',
                season,
                isEvent
            };
        } catch (error) {
            console.error('Error parsing iCal event:', error);
            return null;
        }
    }
    
    private async fetchFromGoogleCalendar(): Promise<Omit<IMatch, 'id'>[]> {
        try {
            // FC Verachtert public calendar
            const calendarId = 'fcverachtert@gmail.com';
            const apiKey = 'AIzaSyBNlYH01_9Hc5S6J9vuFmu2nUfkBF51g0o'; // Public API key for calendar access
            
            // Haal events op van de laatste 6 maanden
            const now = new Date();
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            const timeMin = sixMonthsAgo.toISOString();
            const timeMax = now.toISOString();
            
            const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
            
            console.log('Fetching from Google Calendar API...');
            const response = await axios.get(url);
            
            if (response.data && response.data.items) {
                const events = response.data.items;
                console.log(`Found ${events.length} calendar events`);
                
                const matches: Omit<IMatch, 'id'>[] = [];
                
                for (const event of events) {
                    // Parse event voor wedstrijdinformatie
                    const match = this.parseGoogleCalendarEvent(event);
                    if (match) {
                        matches.push(match);
                    }
                }
                
                return matches;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching from Google Calendar:', error);
            return [];
        }
    }
    
    private parseGoogleCalendarEvent(event: any): Omit<IMatch, 'id'> | null {
        try {
            const summary = event.summary || '';
            const description = event.description || '';
            const startDate = event.start?.date || event.start?.dateTime;
            
            if (!startDate) return null;
            
            // Parse datum
            const date = startDate.split('T')[0];
            
            // Probeer tegenstander te vinden uit de titel
            // Formaat kan zijn: "FC Verachtert - Tegenstander" of "Tegenstander - FC Verachtert"
            let opponent = 'Onbekende tegenstander';
            let isHomeGame = true;
            
            if (summary.includes(' - ')) {
                const parts = summary.split(' - ');
                if (parts[0].toLowerCase().includes('verachtert')) {
                    opponent = parts[1].trim();
                    isHomeGame = true;
                } else if (parts[1].toLowerCase().includes('verachtert')) {
                    opponent = parts[0].trim();
                    isHomeGame = false;
                } else {
                    opponent = parts[1].trim();
                }
            } else if (summary.toLowerCase().includes('vs')) {
                const parts = summary.split(/vs/i);
                if (parts[0].toLowerCase().includes('verachtert')) {
                    opponent = parts[1].trim();
                    isHomeGame = true;
                } else {
                    opponent = parts[0].trim();
                    isHomeGame = false;
                }
            } else {
                // Als er geen duidelijk patroon is, neem de hele summary als tegenstander
                opponent = summary.replace(/FC Verachtert/gi, '').trim();
            }
            
            // Check of het een thuiswedstrijd is uit de beschrijving
            if (description.toLowerCase().includes('thuis')) {
                isHomeGame = true;
            } else if (description.toLowerCase().includes('uit')) {
                isHomeGame = false;
            }
            
            return {
                date,
                opponent,
                homeScore: 0,
                awayScore: 0,
                isHomeGame,
                scorers: [],
                lineup: [],
                notes: description
            };
            
        } catch (error) {
            console.error('Error parsing calendar event:', error);
            return null;
        }
    }
    
    // Mock data met realistischere wedstrijden voor seizoen 2024-2025
    private getMockMatches(): Omit<IMatch, 'id'>[] {
        const currentYear = new Date().getFullYear();
        return [
            {
                date: `${currentYear - 1}-08-10`,
                opponent: 'KFC Hoegaarden',
                homeScore: 0,
                awayScore: 0,
                isHomeGame: true,
                scorers: [],
                lineup: [],
                notes: ''
            },
            {
                date: `${currentYear - 1}-08-17`,
                opponent: 'VK Tienen',
                homeScore: 0,
                awayScore: 0,
                isHomeGame: false,
                scorers: [],
                lineup: [],
                notes: ''
            },
            {
                date: `${currentYear - 1}-08-24`,
                opponent: 'FC Leuven United',
                homeScore: 0,
                awayScore: 0,
                isHomeGame: true,
                scorers: [],
                lineup: [],
                notes: ''
            },
            {
                date: `${currentYear - 1}-08-31`,
                opponent: 'Sporting Hakendover',
                homeScore: 0,
                awayScore: 0,
                isHomeGame: true,
                scorers: [],
                lineup: [],
                notes: ''
            },
            {
                date: `${currentYear - 1}-09-07`,
                opponent: 'FC Betekom',
                homeScore: 0,
                awayScore: 0,
                isHomeGame: false,
                scorers: [],
                lineup: [],
                notes: ''
            },
            {
                date: `${currentYear - 1}-09-14`,
                opponent: 'KVC Wijgmaal',
                homeScore: 0,
                awayScore: 0,
                isHomeGame: true,
                scorers: [],
                lineup: [],
                notes: ''
            },
            {
                date: `${currentYear - 1}-09-21`,
                opponent: 'FC Aarschot',
                homeScore: 0,
                awayScore: 0,
                isHomeGame: false,
                scorers: [],
                lineup: [],
                notes: ''
            },
            {
                date: `${currentYear - 1}-09-28`,
                opponent: 'SV Rotselaar',
                homeScore: 0,
                awayScore: 0,
                isHomeGame: true,
                scorers: [],
                lineup: [],
                notes: ''
            }
        ];
    }
}
