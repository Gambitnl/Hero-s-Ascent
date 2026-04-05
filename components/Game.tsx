
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  Vector2, Hero, Projectile, MoneyDrop, Monster, Abilities, Archetype, 
  BarbarianAbilities, RupturePath, Effect, LevelUpChoice, Gadgets, Inventory, GameState 
} from './game/types';
import { update as updateLogic } from './game/logic/update';
import { draw as drawGame } from './game/logic/draw';
import { getId } from './game/utils/id';
import { applyLevelUp } from './game/logic/levelUp';
import {
  INITIAL_ABILITIES, INITIAL_GADGETS, INITIAL_INVENTORY, INITIAL_BARBARIAN_ABILITIES, INITIAL_TELEPORTER_ABILITIES,
  INITIAL_KING_ABILITIES, createInitialHero, getLevelMonsters, getSpawnInterval
} from './game/constants';
import {
  StartScreen,
  LevelCompleteScreen,
  LevelUpScreen,
  GameOverScreen,
  PauseScreen,
  ShopScreen,
  TopHUD,
  AbilitiesHUD,
  DevPanel
} from './game/ui';


export default function Game() {
  // --- Component Mounting ---
  // This state ensures that the component only renders on the client-side, 
  // preventing issues with server-side rendering (SSR) and local storage access.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // --- Refs and State ---
  // Refs for accessing DOM elements.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // The main game state, initialized lazily to load data from local storage.
  const [gameState, setGameState] = useState<GameState>(() => {
    let initialMoney = 0;
    let unlockedArchetypes: Archetype[] = ['archer'];
    let archetype: Archetype = 'archer';
    let gadgets: Gadgets = { ...INITIAL_GADGETS };
    let inventory: Inventory = { ...INITIAL_INVENTORY };

    // Load saved data from local storage if on the client-side.
    if (typeof window !== 'undefined') {
      const savedMoney = localStorage.getItem('hero_ascent_money');
      if (savedMoney) {
        initialMoney = parseInt(savedMoney, 10);
      }
      const savedArchetypes = localStorage.getItem('hero_ascent_unlocked_archetypes');
      if (savedArchetypes) {
        try {
          unlockedArchetypes = JSON.parse(savedArchetypes);
        } catch (e) {}
      }
      const savedArchetype = localStorage.getItem('hero_ascent_archetype');
      if (savedArchetype && (savedArchetype === 'archer' || savedArchetype === 'barbarian' || savedArchetype === 'teleporter')) {
        archetype = savedArchetype as Archetype;
      }
      const savedGadgets = localStorage.getItem('hero_ascent_gadgets');
      if (savedGadgets) {
        try {
          gadgets = { ...INITIAL_GADGETS, ...JSON.parse(savedGadgets) };
        } catch (e) {}
      }
      const savedInventory = localStorage.getItem('hero_ascent_inventory');
      if (savedInventory) {
        try {
          inventory = { ...INITIAL_INVENTORY, ...JSON.parse(savedInventory) };
        } catch (e) {}
      }
    }

    // Return the initial game state.
    return {
      status: 'start',
      level: 1,
      hero: createInitialHero(gadgets, inventory, 800, 600),
      projectiles: [],
      monsters: [],
      moneyDrops: [],
      monstersToSpawn: getLevelMonsters(1),
      spawnTimer: 0,
      spawnInterval: getSpawnInterval(1),
      abilities: { ...INITIAL_ABILITIES },
      barbarianAbilities: { ...INITIAL_BARBARIAN_ABILITIES },
      teleporterAbilities: { ...INITIAL_TELEPORTER_ABILITIES },
      kingAbilities: { ...INITIAL_KING_ABILITIES },
      rupturePaths: [],
      effects: [],
      damageTexts: [],
      score: 0,
      money: initialMoney,
      mousePos: { x: 800 / 2, y: 600 / 2 },
      mouseDown: { left: false, right: false },
      keys: {},
      newAbilityMessage: null,
      archetype,
      unlockedArchetypes,
      levelUpChoices: [],
      gadgets,
      inventory,
      attackBoostTimer: 0,
      invulnerabilityTimer: 0,
      potionCooldown: 0,
      bossMessageTimer: 0,
      canvasWidth: 800,
      canvasHeight: 600,
      devSettings: {
        enabled: false,
        godMode: false,
        spawnInert: false,
        spawnImmune: false,
        spawnStopAttacking: false,
      },
    };
  });

  // State for the currently selected shop tab.
  const [shopTab, setShopTab] = useState<'archetypes' | 'gadgets' | 'items'>('archetypes');

  // A ref to the game state is used to provide the most up-to-date state to the game loop.
  const stateRef = useRef<GameState>(gameState);
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  // Refs for managing the game loop timing.
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  // --- Canvas Resizing ---
  // This effect uses a ResizeObserver to keep the canvas dimensions in sync with its container.
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setGameState(prev => ({
          ...prev,
          canvasWidth: width,
          canvasHeight: height,
        }));
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // --- Input Handling ---
  // This effect sets up and tears down event listeners for keyboard and mouse input.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (stateRef.current.status === 'playing') {
          setGameState(prev => ({ ...prev, status: 'paused' }));
        } else if (stateRef.current.status === 'paused') {
          setGameState(prev => ({ ...prev, status: 'playing' }));
        }
      }
      stateRef.current.keys[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) stateRef.current.mouseDown.left = true;
      if (e.button === 2) stateRef.current.mouseDown.right = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) stateRef.current.mouseDown.left = false;
      if (e.button === 2) stateRef.current.mouseDown.right = false;
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const canvasAspect = canvas.width / canvas.height;
      const containerAspect = rect.width / rect.height;

      let scale: number;
      let offsetX = 0;
      let offsetY = 0;

      if (containerAspect > canvasAspect) {
        // Pillarboxed (bars on sides)
        scale = rect.height / canvas.height;
        const renderedWidth = canvas.width * scale;
        offsetX = (rect.width - renderedWidth) / 2;
      } else {
        // Letterboxed (bars on top/bottom)
        scale = rect.width / canvas.width;
        const renderedHeight = canvas.height * scale;
        offsetY = (rect.height - renderedHeight) / 2;
      }

      const mouseX = e.clientX - rect.left - offsetX;
      const mouseY = e.clientY - rect.top - offsetY;

      stateRef.current.mousePos = {
        x: mouseX / scale,
        y: mouseY / scale,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // --- Game Loop ---
  // This effect manages the main game loop using requestAnimationFrame for smooth animation.
  useEffect(() => {
    // The update function advances the game logic.
    const update = (dt: number) => {
      updateLogic(stateRef.current, dt);
      setGameState({ ...stateRef.current });
    };

    // The draw function renders the game state to the canvas.
    const draw = (ctx: CanvasRenderingContext2D) => {
      drawGame(stateRef.current, ctx);
    };

    // The main loop function, called on each frame.
    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Cap dt to prevent large jumps in game logic if the tab is inactive.
      const cappedDt = Math.min(dt, 0.1);

      update(cappedDt);

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          draw(ctx);
        }
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // --- Game State Transitions ---

  /**
   * Starts the next level of the game.
   */
  const startNextLevel = () => {
    setGameState(prev => {
      const newHeroPos = { x: prev.canvasWidth / 2, y: prev.canvasHeight / 2 };
      
      // Move charmed/friendly monsters near the hero.
      const newMonsters = prev.monsters.map(m => {
        if (m.isCharmed || m.isFriendly) {
          return {
            ...m,
            pos: {
              x: newHeroPos.x + (Math.random() - 0.5) * 100,
              y: newHeroPos.y + (Math.random() - 0.5) * 100
            }
          };
        }
        return m;
      });

      return {
        ...prev,
        status: 'playing',
        monsters: newMonsters,
        monstersToSpawn: getLevelMonsters(prev.level),
        spawnTimer: 0,
        spawnInterval: getSpawnInterval(prev.level),
        newAbilityMessage: null,
        projectiles: [],
        // Reset hero position to the center.
        hero: {
          ...prev.hero,
          pos: newHeroPos,
        }
      };
    });
  };

  /**
   * Restarts the game from the beginning.
   */
  const restartGame = () => {
    setGameState(prev => ({
      status: 'playing',
      level: 1,
      hero: createInitialHero(prev.gadgets, prev.inventory, prev.canvasWidth, prev.canvasHeight),
      projectiles: [],
      monsters: [],
      moneyDrops: [],
      monstersToSpawn: getLevelMonsters(1),
      spawnTimer: 0,
      spawnInterval: getSpawnInterval(1),
      abilities: { ...INITIAL_ABILITIES },
      barbarianAbilities: { ...INITIAL_BARBARIAN_ABILITIES },
      teleporterAbilities: { ...INITIAL_TELEPORTER_ABILITIES },
      kingAbilities: { ...INITIAL_KING_ABILITIES },
      rupturePaths: [],
      effects: [],
      damageTexts: [],
      score: 0,
      money: prev.money,
      mousePos: { x: prev.canvasWidth / 2, y: prev.canvasHeight / 2 },
      mouseDown: { left: false, right: false },
      keys: {},
      newAbilityMessage: null,
      archetype: prev.archetype,
      unlockedArchetypes: prev.unlockedArchetypes,
      levelUpChoices: [],
      gadgets: prev.gadgets,
      inventory: prev.inventory,
      attackBoostTimer: 0,
      invulnerabilityTimer: 0,
      potionCooldown: 0,
      bossMessageTimer: 0,
      canvasWidth: prev.canvasWidth,
      canvasHeight: prev.canvasHeight,
      devSettings: prev.devSettings,
    }));
  };

  /**
   * Starts the game from the main menu.
   */
  const startGame = () => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  };

  /**
   * Pauses the game.
   */
  const pauseGame = () => {
    setGameState(prev => ({ ...prev, status: 'paused' }));
  };

  /**
   * Resumes the game from a paused state.
   */
  const resumeGame = () => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  };

  /**
   * Navigates to the shop screen.
   */
  const goToShop = () => {
    setGameState(prev => ({ ...prev, status: 'shop' }));
  };

  /**
   * Returns to the main menu.
   */
  const goToMainMenu = () => {
    setGameState(prev => ({
      status: 'start',
      level: 1,
      hero: createInitialHero(prev.gadgets, prev.inventory, prev.canvasWidth, prev.canvasHeight),
      projectiles: [],
      monsters: [],
      moneyDrops: [],
      monstersToSpawn: getLevelMonsters(1),
      spawnTimer: 0,
      spawnInterval: getSpawnInterval(1),
      abilities: { ...INITIAL_ABILITIES },
      barbarianAbilities: { ...INITIAL_BARBARIAN_ABILITIES },
      teleporterAbilities: { ...INITIAL_TELEPORTER_ABILITIES },
      kingAbilities: { ...INITIAL_KING_ABILITIES },
      rupturePaths: [],
      effects: [],
      damageTexts: [],
      score: 0,
      money: prev.money,
      mousePos: { x: prev.canvasWidth / 2, y: prev.canvasHeight / 2 },
      mouseDown: { left: false, right: false },
      keys: {},
      newAbilityMessage: null,
      archetype: prev.archetype,
      unlockedArchetypes: prev.unlockedArchetypes,
      levelUpChoices: [],
      gadgets: prev.gadgets,
      inventory: prev.inventory,
      attackBoostTimer: 0,
      invulnerabilityTimer: 0,
      potionCooldown: 0,
      bossMessageTimer: 0,
      canvasWidth: prev.canvasWidth,
      canvasHeight: prev.canvasHeight,
      devSettings: prev.devSettings,
    }));
  };

  // --- Rendering ---
  
  // Do not render the component until it is mounted on the client-side.
  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-row items-start justify-center h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-500/30 overflow-hidden p-4 gap-4">
      
      {/* Left sidebar with top HUD and dev panel */}
      <div className="flex flex-col gap-4 w-64 shrink-0 h-full overflow-y-auto custom-scrollbar pr-2">
        <TopHUD gameState={gameState} pauseGame={pauseGame} />
        <DevPanel gameState={gameState} setGameState={setGameState} />
      </div>

      {/* Main game area with canvas and UI overlays */}
      <div ref={containerRef} className="relative flex-1 h-full max-w-6xl rounded-xl overflow-hidden shadow-2xl shadow-blue-900/20 ring-1 ring-white/10 flex flex-col justify-center">
        <canvas
          ref={canvasRef}
          width={gameState.canvasWidth}
          height={gameState.canvasHeight}
          className="block cursor-crosshair w-full h-full object-contain"
        />

        {/* Animated UI overlays for different game states */}
        <AnimatePresence>
          {gameState.status === 'start' && (
            <StartScreen gameState={gameState} startGame={startGame} />
          )}

          {gameState.status === 'level_complete' && (
            <LevelCompleteScreen gameState={gameState} startNextLevel={startNextLevel} />
          )}

          {gameState.status === 'level_up' && (
            <LevelUpScreen gameState={gameState} setGameState={setGameState} />
          )}

          {gameState.status === 'game_over' && (
            <GameOverScreen gameState={gameState} restartGame={restartGame} />
          )}

          {gameState.status === 'paused' && (
            <PauseScreen resumeGame={resumeGame} goToShop={goToShop} goToMainMenu={goToMainMenu} />
          )}

          {gameState.status === 'shop' && (
            <ShopScreen gameState={gameState} setGameState={setGameState} shopTab={shopTab} setShopTab={setShopTab} />
          )}
        </AnimatePresence>
      </div>
      
      {/* Right sidebar with abilities HUD */}
      <div className="flex flex-col gap-4 w-64 shrink-0 h-full overflow-y-auto custom-scrollbar pl-2">
        <AbilitiesHUD gameState={gameState} />
      </div>
    </div>
  );
}
