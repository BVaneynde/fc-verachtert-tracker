import { Player as IPlayer } from '../types';

export class Player implements IPlayer {
    constructor(
        public id: number,
        public name: string,
        public position: string,
        public jerseyNumber: number
    ) {}
}