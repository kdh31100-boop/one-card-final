export enum Suit {
  Dragon = 'Dragon',   // Blue/Cyan
  Phoenix = 'Phoenix', // Red/Orange
  Tiger = 'Tiger',     // White/Silver
  Turtle = 'Turtle'    // Black/Dark Green
}

export enum Rank {
  Ace = 'A',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7', // Change Shape
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',  // Jump
  Queen = 'Q', // Reverse
  King = 'K'   // Attack
}

export interface CardData {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface ParticleData {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

export interface GameState {
  deck: CardData[];
  discardPile: CardData[];
  playerHand: CardData[];
  cpuHand: CardData[];
  turn: 'player' | 'cpu';
  winner: 'player' | 'cpu' | null;
  drawCount: number; // For attack stacking
  message: string;
  messageType: 'normal' | 'impact' | 'error';
}