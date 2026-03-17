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
  createInitialHero, getLevelMonsters, getSpawnInterval 
} from './game/constants';
import {
  StartScreen,
  LevelCompleteScreen,
  LevelUpScreen,
  GameOverScreen,
  PauseScreen,
  ShopScreen,
  TopHUD,
  BottomHUD,
  DevPanel
} from './game/ui';


export default function Game() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>(() => {
    let initialMoney = 0;
    let unlockedArchetypes: Archetype[] = ['archer'];
    let archetype: Archetype = 'archer';
    let gadgets: Gadgets = { ...INITIAL_GADGETS };
    let inventory: Inventory = { ...INITIAL_INVENTORY };

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
        spawnInert: false,
        spawnImmune: false,
        spawnStopAttacking: false,
      },
    };
  });

  const [shopTab, setShopTab] = useState<'archetypes' | 'gadgets' | 'items'>('archetypes');

  const stateRef = useRef<GameState>(gameState);
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      stateRef.current.mousePos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
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

  useEffect(() => {
    const update = (dt: number) => {
      updateLogic(stateRef.current, dt);
      setGameState({ ...stateRef.current });
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      drawGame(stateRef.current, ctx);
    };

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Cap dt to prevent huge jumps if tab is inactive
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

  const startNextLevel = () => {
    setGameState(prev => {
      const newHeroPos = { x: prev.canvasWidth / 2, y: prev.canvasHeight / 2 };
      
      // Move charmed/friendly monsters near the hero
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
        // Reset hero position to center
        hero: {
          ...prev.hero,
          pos: newHeroPos,
        }
      };
    });
  };

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

  const startGame = () => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, status: 'paused' }));
  };

  const resumeGame = () => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  };

  const goToShop = () => {
    setGameState(prev => ({ ...prev, status: 'shop' }));
  };

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

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-row items-start justify-center h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-500/30 overflow-hidden p-4 gap-4">
      
      <div className="flex flex-col gap-4 w-64 shrink-0 h-full overflow-y-auto custom-scrollbar pr-2">
        <TopHUD gameState={gameState} pauseGame={pauseGame} />
        <DevPanel gameState={gameState} setGameState={setGameState} />
      </div>

      <div ref={containerRef} className="relative flex-1 h-full max-w-6xl rounded-xl overflow-hidden shadow-2xl shadow-blue-900/20 ring-1 ring-white/10 flex flex-col justify-center">
        <canvas
          ref={canvasRef}
          width={gameState.canvasWidth}
          height={gameState.canvasHeight}
          className="block cursor-crosshair w-full h-full object-contain"
        />

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
      
      <div className="flex flex-col gap-4 w-64 shrink-0 h-full overflow-y-auto custom-scrollbar pl-2">
        <BottomHUD gameState={gameState} />
      </div>
    </div>
  );
}
