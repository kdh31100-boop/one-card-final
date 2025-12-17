import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createDeck, isValidMove, shuffleDeck, getSuitColor } from './utils';
import { CardData, GameState, Rank, Suit } from './types';
import Card from './components/Card';
import ParticleSystem from './components/Particles';

const App: React.FC = () => {
  // Scaling State
  const [scale, setScale] = useState(1);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    discardPile: [],
    playerHand: [],
    cpuHand: [],
    turn: 'player',
    winner: null,
    drawCount: 0,
    message: 'Welcome to Ink Flow',
    messageType: 'normal'
  });

  // FX State
  const [shake, setShake] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0); // Counter to trigger effect
  const [particlePos, setParticlePos] = useState({ x: 0, y: 0, color: '#000' });

  // Calculate Scale for 2K Resolution
  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 2560;
      const targetHeight = 1440;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const scaleX = windowWidth / targetWidth;
      const scaleY = windowHeight / targetHeight;
      
      // Use the smaller scale to fit the screen (Letterboxing)
      setScale(Math.min(scaleX, scaleY));
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Game
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewGame = () => {
    const deck = createDeck();
    const playerHand = deck.splice(0, 7);
    const cpuHand = deck.splice(0, 7);
    const firstCard = deck.shift()!;

    setGameState({
      deck,
      discardPile: [firstCard],
      playerHand,
      cpuHand,
      turn: 'player',
      winner: null,
      drawCount: 0,
      message: 'Your Turn',
      messageType: 'normal'
    });
  };

  // Helper: Trigger visual feedback
  const triggerImpact = (intensity: 'low' | 'high', color: string) => {
    if (intensity === 'high') {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    
    // Center of screen roughly
    setParticlePos({ x: 1280, y: 720, color }); 
    setParticleTrigger(prev => prev + 1);
  };

  // Turn Management
  const handleTurnEnd = useCallback((nextTurn: 'player' | 'cpu', specialEffect?: string) => {
    setGameState(prev => {
        let msg = nextTurn === 'player' ? 'Your Turn' : "Opponent's Turn";
        let type: 'normal' | 'impact' = 'normal';

        if (specialEffect) {
            msg = specialEffect;
            type = 'impact';
        }

        return {
            ...prev,
            turn: nextTurn,
            message: msg,
            messageType: type
        };
    });
  }, []);

  // Card Effects Logic
  const processCardEffect = useCallback((card: CardData, currentTurn: 'player' | 'cpu') => {
    let nextTurn = currentTurn === 'player' ? 'cpu' : 'player';
    let effectMsg = '';
    let effectIntensity: 'low' | 'high' = 'low';

    // J - Jump (Skip)
    if (card.rank === Rank.Jack) {
      nextTurn = currentTurn; // Play again
      effectMsg = 'JUMP! Play Again';
      effectIntensity = 'high';
    }
    // Q - Reverse (In 1v1, it's play again)
    else if (card.rank === Rank.Queen) {
      nextTurn = currentTurn;
      effectMsg = 'REVERSE! Play Again';
      effectIntensity = 'high';
    }
    // K - Attack (Opponent draws 2)
    else if (card.rank === Rank.King) {
       // In a real game, this would stack. Here we simplify: immediate penalty.
       effectMsg = 'ATTACK! Opponent draws 2';
       effectIntensity = 'high';
       // Logic handled in state update below
    }
    // 7 - Change Shape (Wild - simplified to just playing it)
    else if (card.rank === Rank.Seven) {
        effectMsg = 'CHANGE SHAPE!';
        effectIntensity = 'low';
    }

    const suitColor = getSuitColor(card.suit);
    triggerImpact(effectIntensity, suitColor);

    return { nextTurn, effectMsg, effectIntensity };
  }, []);

  // Player Move
  const handlePlayerCardClick = (card: CardData) => {
    if (gameState.turn !== 'player' || gameState.winner) return;

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];

    if (isValidMove(card, topCard)) {
        const { nextTurn, effectMsg } = processCardEffect(card, 'player');
        
        // Remove from hand, add to discard
        const newHand = gameState.playerHand.filter(c => c.id !== card.id);
        const newDiscard = [...gameState.discardPile, card];
        
        // Handle King Attack Effect immediate application for simplicity
        let newCpuHand = [...gameState.cpuHand];
        let newDeck = [...gameState.deck];

        if (card.rank === Rank.King) {
            // CPU draws 2
            const draw = newDeck.splice(0, 2);
            newCpuHand = [...newCpuHand, ...draw];
        }

        setGameState(prev => ({
            ...prev,
            playerHand: newHand,
            cpuHand: newCpuHand,
            discardPile: newDiscard,
            deck: newDeck,
            turn: nextTurn as 'player' | 'cpu',
            message: effectMsg || "Opponent's Turn",
            messageType: effectMsg ? 'impact' : 'normal'
        }));

        // Check Win
        if (newHand.length === 0) {
            setGameState(prev => ({ ...prev, winner: 'player', message: 'VICTORY!', messageType: 'impact' }));
        }

    } else {
        // Invalid Move visual feedback
        setGameState(prev => ({ ...prev, message: 'Invalid Move', messageType: 'error' }));
        setTimeout(() => setGameState(prev => ({ ...prev, message: 'Your Turn', messageType: 'normal' })), 1000);
    }
  };

  const handleDrawCard = () => {
    if (gameState.turn !== 'player' || gameState.winner) return;
    
    // Draw 1
    const newDeck = [...gameState.deck];
    if (newDeck.length === 0) {
        // Reshuffle discard if empty (simplified: just game over or message in this demo)
        setGameState(prev => ({...prev, message: 'Deck Empty! Draw', winner: 'cpu'})); // Fail state for demo
        return;
    }

    const drawnCard = newDeck.shift()!;
    setGameState(prev => ({
        ...prev,
        deck: newDeck,
        playerHand: [...prev.playerHand, drawnCard],
        turn: 'cpu',
        message: "Opponent's Turn",
        messageType: 'normal'
    }));
  };

  // CPU AI
  useEffect(() => {
    if (gameState.turn === 'cpu' && !gameState.winner) {
        const timer = setTimeout(() => {
            const topCard = gameState.discardPile[gameState.discardPile.length - 1];
            const playableCards = gameState.cpuHand.filter(c => isValidMove(c, topCard));
            
            // AI Logic: Prioritize Special Cards (K, J, Q) then matching Suit
            playableCards.sort((a, b) => {
                 const isSpecialA = [Rank.King, Rank.Jack, Rank.Queen, Rank.Seven].includes(a.rank);
                 const isSpecialB = [Rank.King, Rank.Jack, Rank.Queen, Rank.Seven].includes(b.rank);
                 if (isSpecialA && !isSpecialB) return -1;
                 if (!isSpecialA && isSpecialB) return 1;
                 return 0;
            });

            if (playableCards.length > 0) {
                const cardToPlay = playableCards[0];
                const { nextTurn, effectMsg } = processCardEffect(cardToPlay, 'cpu');
                
                const newCpuHand = gameState.cpuHand.filter(c => c.id !== cardToPlay.id);
                const newDiscard = [...gameState.discardPile, cardToPlay];
                
                let newPlayerHand = [...gameState.playerHand];
                let newDeck = [...gameState.deck];

                if (cardToPlay.rank === Rank.King) {
                    const draw = newDeck.splice(0, 2);
                    newPlayerHand = [...newPlayerHand, ...draw];
                }

                setGameState(prev => ({
                    ...prev,
                    cpuHand: newCpuHand,
                    playerHand: newPlayerHand,
                    discardPile: newDiscard,
                    deck: newDeck,
                    turn: nextTurn as 'player' | 'cpu',
                    message: effectMsg || "Your Turn",
                    messageType: effectMsg ? 'impact' : 'normal'
                }));

                if (newCpuHand.length === 0) {
                    setGameState(prev => ({ ...prev, winner: 'cpu', message: 'DEFEAT', messageType: 'impact' }));
                }

            } else {
                // Must Draw
                const newDeck = [...gameState.deck];
                if (newDeck.length === 0) return; // Edge case
                
                const drawnCard = newDeck.shift()!;
                setGameState(prev => ({
                    ...prev,
                    deck: newDeck,
                    cpuHand: [...prev.cpuHand, drawnCard],
                    turn: 'player',
                    message: "Your Turn",
                    messageType: 'normal'
                }));
            }

        }, 1500); // Thinking time

        return () => clearTimeout(timer);
    }
  }, [gameState.turn, gameState.winner, gameState.discardPile, gameState.cpuHand, gameState.deck, gameState.playerHand, processCardEffect]);


  // Rendering
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];

  return (
    <div className="w-full h-screen bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
      {/* 2K Game Container */}
      <div 
        style={{ 
          width: '2560px', 
          height: '1440px', 
          transform: `scale(${scale})`,
          transformOrigin: 'center'
        }}
        className={`relative bg-[#F5F5DC] hanji-texture shadow-2xl flex flex-col justify-between overflow-hidden ${shake ? 'shake-anim' : ''}`}
      >
        {/* Background Ambient Ink */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
             <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-stone-800 rounded-full blur-[150px] opacity-40"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-stone-700 rounded-full blur-[120px] opacity-30"></div>
        </div>

        {/* Particles */}
        <ParticleSystem trigger={particleTrigger > 0} x={particlePos.x} y={particlePos.y} color={particlePos.color} />

        {/* --- Top Area: CPU --- */}
        <div className="h-[400px] w-full flex flex-col items-center justify-start pt-12 relative z-10">
            <div className="text-stone-500 font-bold mb-4 tracking-widest text-2xl uppercase">Opponent</div>
            <div className="flex justify-center items-center">
                {gameState.cpuHand.map((card, i) => (
                    <Card key={card.id} card={card} isHidden={true} />
                ))}
            </div>
            <div className="mt-4 text-stone-400">Cards: {gameState.cpuHand.length}</div>
        </div>

        {/* --- Center Area: Table --- */}
        <div className="flex-1 flex items-center justify-center relative z-20 gap-20">
            
            {/* Deck */}
            <div 
                onClick={handleDrawCard}
                className={`
                    w-40 h-60 rounded-xl bg-stone-900 border-4 border-stone-700 shadow-xl 
                    flex items-center justify-center cursor-pointer hover:scale-105 transition-transform
                    ${gameState.turn === 'player' ? 'ring-4 ring-blue-400/50' : ''}
                `}
            >
                <span className="text-white font-serif font-bold text-xl">Draw</span>
            </div>

            {/* Discard Pile (Action Zone) */}
            <div className="relative w-40 h-60">
                {/* Phantom stack effect */}
                <div className="absolute top-2 left-2 w-full h-full bg-stone-300 rounded-xl border border-stone-400 transform rotate-3"></div>
                <div className="absolute top-1 left-1 w-full h-full bg-stone-200 rounded-xl border border-stone-400 transform -rotate-2"></div>
                
                {/* The Top Card */}
                {topDiscard && (
                    <div className="absolute inset-0 transform scale-125 z-30 transition-all duration-300">
                        <Card card={topDiscard} isPlayable={false} />
                    </div>
                )}
            </div>

            {/* Message / Notification Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 text-center w-full">
                <h1 
                    key={gameState.message} 
                    className={`
                        font-black text-8xl transition-all duration-300 drop-shadow-xl
                        ${gameState.messageType === 'impact' ? 'scale-150 text-red-700 animate-bounce' : 'scale-100 text-stone-800'}
                        ${gameState.messageType === 'error' ? 'text-stone-500 shake-anim' : ''}
                    `}
                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                >
                    {gameState.message}
                </h1>
                {gameState.winner && (
                    <button 
                        onClick={() => startNewGame()}
                        className="mt-8 pointer-events-auto bg-stone-800 text-[#F5F5DC] px-12 py-4 rounded-full text-3xl font-bold hover:bg-stone-700 transition-colors shadow-lg"
                    >
                        Play Again
                    </button>
                )}
            </div>

        </div>

        {/* --- Bottom Area: Player --- */}
        <div className="h-[450px] w-full flex flex-col items-center justify-end pb-12 relative z-30">
             <div className="mb-8 flex justify-center items-end h-64 px-20 w-full max-w-[1800px]">
                {gameState.playerHand.map((card, i) => {
                    const playable = isValidMove(card, topDiscard) && gameState.turn === 'player';
                    return (
                        <Card 
                            key={card.id} 
                            card={card} 
                            isPlayable={playable}
                            onClick={() => handlePlayerCardClick(card)}
                        />
                    );
                })}
             </div>
             <div className="text-stone-800 font-bold text-2xl tracking-widest uppercase mb-4">
                 Your Hand {gameState.turn === 'player' && <span className="text-blue-600 animate-pulse ml-2">●</span>}
             </div>
        </div>

      </div>
    </div>
  );
};

export default App;