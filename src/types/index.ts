export interface Player {
    id: number;
    name: string;
    position: string;
    jerseyNumber: number;
}

export interface Match {
    id: number;
    date: string;
    opponent: string;
    homeScore: number;
    awayScore: number;
    isHomeGame: boolean;
    scorers?: MatchScorer[];
    lineup?: number[]; // Player IDs
    notes?: string;
    season?: string; // Format: "2024-2025"
    isEvent?: boolean; // true voor evenementen (BBQ, etc), false voor wedstrijden
}

export interface MatchScorer {
    playerId: number;
    playerName?: string;
    goals: number;
}

export interface GoalScorer {
    id: number;
    matchId: number;
    playerId: number;
    goals: number;
}