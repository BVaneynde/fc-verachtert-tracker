import { GoalScorer as IGoalScorer } from '../types';

export class GoalScorer implements IGoalScorer {
    constructor(
        public id: number,
        public matchId: number,
        public playerId: number,
        public goals: number
    ) {}
}