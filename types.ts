export interface SimulationStep {
  round: number;
  fullKelly: number;
  halfKelly: number;
  doubleKelly: number; // The danger zone
  fixedBet: number;
  outcome?: 'WIN' | 'LOSS';
}

export interface SimulationParams {
  winRate: number; // 0 to 1
  odds: number; // Decimal odds (e.g. 2.0 means 1:1 payout)
  initialWealth: number;
  totalRounds: number;
}

export interface KellyMetrics {
  fStar: number; // Optimal fraction
  edge: number; // Expected value per bet
  oddsB: number; // b in the formula (odds - 1)
}

export interface CrashGameHistory {
  id: number;
  crashPoint: number;
  target: number;
  bet: number;
  profit: number;
  result: 'CRASHED' | 'CASHED';
}
