import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchDocument extends Document {
    matchId: number;
    date: string;
    opponent: string;
    homeScore: number;
    awayScore: number;
    isHomeGame: boolean;
    scorers: Array<{ playerId: number; playerName: string; goals: number }>;
    lineup: number[];
    notes: string;
    season?: string;
    isEvent?: boolean;
}

const MatchSchema = new Schema<IMatchDocument>({
    matchId: { type: Number, required: true, unique: true },
    date: { type: String, required: true },
    opponent: { type: String, required: true },
    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },
    isHomeGame: { type: Boolean, required: true },
    scorers: [{
        playerId: Number,
        playerName: String,
        goals: Number
    }],
    lineup: [Number],
    notes: { type: String, default: '' },
    season: String,
    isEvent: { type: Boolean, default: false }
}, { timestamps: true });

export const MatchModel = mongoose.model<IMatchDocument>('Match', MatchSchema);
