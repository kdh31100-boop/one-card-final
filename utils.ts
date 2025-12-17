import { Suit, Rank, CardData } from './types';

// Helper to generate a unique ID
const uid = () => Math.random().toString(36).substr(2, 9);

export const createDeck = (): CardData[] => {
  const suits = [Suit.Dragon, Suit.Phoenix, Suit.Tiger, Suit.Turtle];
  const ranks = Object.values(Rank);
  let deck: CardData[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ id: uid(), suit, rank });
    }
  }
  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: CardData[]): CardData[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const isValidMove = (card: CardData, topCard: CardData): boolean => {
  // Rank 7 is a wild card (Change Shape) logic, technically always playable in this simplified version
  // or specific matching rules. Standard One Card: Match Suit OR Match Rank.
  if (card.rank === Rank.Seven) return true; 
  return card.suit === topCard.suit || card.rank === topCard.rank;
};

export const getSuitColor = (suit: Suit): string => {
  switch (suit) {
    case Suit.Dragon: return '#0ea5e9'; // Sky Blue
    case Suit.Phoenix: return '#ef4444'; // Red
    case Suit.Tiger: return '#57534e'; // Warm Gray
    case Suit.Turtle: return '#000000'; // Black
    default: return '#000000';
  }
};

export const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case Suit.Dragon: return '🐉';
    case Suit.Phoenix: return '🪶'; // Abstract Phoenix feather
    case Suit.Tiger: return '🐯';
    case Suit.Turtle: return '🐢';
    default: return '?';
  }
};