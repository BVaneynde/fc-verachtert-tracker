import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerDocument extends Document {
    playerId: number;
    name: string;
    position: string;
    jerseyNumber: number;
}

const PlayerSchema = new Schema<IPlayerDocument>({
    playerId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    jerseyNumber: { type: Number, required: true }
}, { timestamps: true });

export const PlayerModel = mongoose.model<IPlayerDocument>('Player', PlayerSchema);
