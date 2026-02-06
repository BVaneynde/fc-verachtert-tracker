import { Match as IMatch, MatchScorer } from '../types';

export class Match implements IMatch {
    constructor(
        public id: number,
        public date: string,
        public opponent: string,
        public homeScore: number,
        public awayScore: number,
        public isHomeGame: boolean,
        public scorers?: MatchScorer[],
        public lineup?: number[],
        public notes?: string,
        public season?: string,
        public isEvent?: boolean
    ) {}
}