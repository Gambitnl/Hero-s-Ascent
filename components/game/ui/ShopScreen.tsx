
// Import necessary libraries and types
import React from 'react';
import { motion } from 'motion/react';
import { GameState, Archetype } from '../types';

// Define the props for the ShopScreen component
interface ShopScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  shopTab: 'archetypes' | 'gadgets' | 'items';
  setShopTab: React.Dispatch<React.SetStateAction<'archetypes' | 'gadgets' | 'items'>>;
}

// The ShopScreen component renders the in-game shop UI
export function ShopScreen({ gameState, setGameState, shopTab, setShopTab }: ShopScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-neutral-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
    >
      {/* Shop title and player's money */}
      <h2 className="text-4xl font-bold text-purple-400 mb-4">Shop</h2>
      <p className="text-yellow-400 mb-6 text-xl">Money: ${gameState.money}</p>
      
      {/* Tabs for different shop sections */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShopTab('archetypes')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${shopTab === 'archetypes' ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
        >
          Archetypes
        </button>
        <button
          onClick={() => setShopTab('gadgets')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${shopTab === 'gadgets' ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
        >
          Gadgets
        </button>
        <button
          onClick={() => setShopTab('items')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${shopTab === 'items' ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
        >
          Items
        </button>
      </div>

      {/* Main content area for the shop */}
      <div className="text-neutral-300 mb-8 bg-neutral-800/50 p-6 rounded-lg border border-neutral-700 w-full max-w-2xl min-h-[300px] max-h-[60vh] overflow-y-auto flex flex-col">
        {/* Archetypes Tab */}
        {shopTab === 'archetypes' && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-2xl font-bold mb-2 text-white text-left">Archetypes</h3>
            <p className="text-sm text-neutral-400 text-left mb-6">Unlock and customize archetypes. Each archetype gains unique upgrades per wave!</p>
            <div className="flex-1 flex flex-col gap-4">
              
              {/* Archer Archetype */}
              <div className={`p-4 rounded-lg border flex items-center justify-between ${gameState.archetype === 'archer' ? 'bg-blue-900/40 border-blue-500' : 'bg-neutral-800 border-neutral-700'}`}>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-white">Archer</h4>
                  <p className="text-sm text-neutral-400">The classic ranged attacker.</p>
                </div>
                <button
                  onClick={() => {
                    setGameState(prev => {
                      if (typeof window !== 'undefined') localStorage.setItem('hero_ascent_archetype', 'archer');
                      return { ...prev, archetype: 'archer' };
                    });
                  }}
                  className={`px-4 py-2 rounded font-bold ${gameState.archetype === 'archer' ? 'bg-blue-600 text-white cursor-default' : 'bg-neutral-700 text-white hover:bg-neutral-600'}`}
                  disabled={gameState.archetype === 'archer'}
                >
                  {gameState.archetype === 'archer' ? 'Selected' : 'Select'}
                </button>
              </div>

              {/* Barbarian Archetype */}
              <div className={`p-4 rounded-lg border flex items-center justify-between ${gameState.archetype === 'barbarian' ? 'bg-red-900/40 border-red-500' : 'bg-neutral-800 border-neutral-700'}`}>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-red-400">Barbarian (Tank)</h4>
                  <p className="text-sm text-neutral-400">Melee powerhouse.</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">LMB: Slash</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">RMB: Spin</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">Q: Rupture</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">E: Dash</span>
                  </div>
                </div>
                {gameState.unlockedArchetypes.includes('barbarian') ? (
                  <button
                    onClick={() => {
                      setGameState(prev => {
                        if (typeof window !== 'undefined') localStorage.setItem('hero_ascent_archetype', 'barbarian');
                        return { ...prev, archetype: 'barbarian' };
                      });
                    }}
                    className={`px-4 py-2 rounded font-bold ${gameState.archetype === 'barbarian' ? 'bg-red-600 text-white cursor-default' : 'bg-neutral-700 text-white hover:bg-neutral-600'}`}
                    disabled={gameState.archetype === 'barbarian'}
                  >
                    {gameState.archetype === 'barbarian' ? 'Selected' : 'Select'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (gameState.money >= 500) {
                        setGameState(prev => {
                          const newMoney = prev.money - 500;
                          const newUnlocked = [...prev.unlockedArchetypes, 'barbarian'];
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('hero_ascent_money', newMoney.toString());
                            localStorage.setItem('hero_ascent_unlocked_archetypes', JSON.stringify(newUnlocked));
                            localStorage.setItem('hero_ascent_archetype', 'barbarian');
                          }
                          return {
                            ...prev,
                            money: newMoney,
                            unlockedArchetypes: newUnlocked as Archetype[],
                            archetype: 'barbarian'
                          };
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded font-bold ${gameState.money >= 500 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                    disabled={gameState.money < 500}
                  >
                    Buy ($500)
                  </button>
                )}
              </div>

              {/* Teleporter Archetype */}
              <div className={`p-4 rounded-lg border flex items-center justify-between ${gameState.archetype === 'teleporter' ? 'bg-purple-900/40 border-purple-500' : 'bg-neutral-800 border-neutral-700'}`}>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-purple-400">Teleporter (Mage)</h4>
                  <p className="text-sm text-neutral-400">Master of space and summoning.</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">LMB: Boomerang</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">RMB: Black Bolt</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">Q: Dimension Doors</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">E: Teleport Ally</span>
                  </div>
                </div>
                {gameState.unlockedArchetypes.includes('teleporter') ? (
                  <button
                    onClick={() => {
                      setGameState(prev => {
                        if (typeof window !== 'undefined') localStorage.setItem('hero_ascent_archetype', 'teleporter');
                        return { ...prev, archetype: 'teleporter' };
                      });
                    }}
                    className={`px-4 py-2 rounded font-bold ${gameState.archetype === 'teleporter' ? 'bg-purple-600 text-white cursor-default' : 'bg-neutral-700 text-white hover:bg-neutral-600'}`}
                    disabled={gameState.archetype === 'teleporter'}
                  >
                    {gameState.archetype === 'teleporter' ? 'Selected' : 'Select'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (gameState.money >= 1000) {
                        setGameState(prev => {
                          const newMoney = prev.money - 1000;
                          const newUnlocked = [...prev.unlockedArchetypes, 'teleporter'];
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('hero_ascent_money', newMoney.toString());
                            localStorage.setItem('hero_ascent_unlocked_archetypes', JSON.stringify(newUnlocked));
                            localStorage.setItem('hero_ascent_archetype', 'teleporter');
                          }
                          return {
                            ...prev,
                            money: newMoney,
                            unlockedArchetypes: newUnlocked as Archetype[],
                            archetype: 'teleporter'
                          };
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded font-bold ${gameState.money >= 1000 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                    disabled={gameState.money < 1000}
                  >
                    Buy ($1000)
                  </button>
                )}
              </div>

              {/* King Archetype */}
              <div className={`p-4 rounded-lg border flex items-center justify-between ${gameState.archetype === 'king' ? 'bg-yellow-900/40 border-yellow-500' : 'bg-neutral-800 border-neutral-700'}`}>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-yellow-400">King (Summoner)</h4>
                  <p className="text-sm text-neutral-400">Commands the battlefield with cannonballs and chess piece allies.</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">LMB: King Ball</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">RMB: Royal Smack</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">Q: Ultra Spin</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs text-white">E: Royal Help</span>
                  </div>
                </div>
                {gameState.unlockedArchetypes.includes('king') ? (
                  <button
                    onClick={() => {
                      setGameState(prev => {
                        if (typeof window !== 'undefined') localStorage.setItem('hero_ascent_archetype', 'king');
                        return { ...prev, archetype: 'king' };
                      });
                    }}
                    className={`px-4 py-2 rounded font-bold ${gameState.archetype === 'king' ? 'bg-yellow-600 text-white cursor-default' : 'bg-neutral-700 text-white hover:bg-neutral-600'}`}
                    disabled={gameState.archetype === 'king'}
                  >
                    {gameState.archetype === 'king' ? 'Selected' : 'Select'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (gameState.money >= 800) {
                        setGameState(prev => {
                          const newMoney = prev.money - 800;
                          const newUnlocked = [...prev.unlockedArchetypes, 'king'];
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('hero_ascent_money', newMoney.toString());
                            localStorage.setItem('hero_ascent_unlocked_archetypes', JSON.stringify(newUnlocked));
                            localStorage.setItem('hero_ascent_archetype', 'king');
                          }
                          return {
                            ...prev,
                            money: newMoney,
                            unlockedArchetypes: newUnlocked as Archetype[],
                            archetype: 'king'
                          };
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded font-bold ${gameState.money >= 800 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                    disabled={gameState.money < 800}
                  >
                    Buy ($800)
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
        {/* Gadgets Tab */}
        {shopTab === 'gadgets' && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-2xl font-bold mb-2 text-white text-left">Gadgets</h3>
            <p className="text-sm text-neutral-400 text-left mb-6">Purchase powerful gadgets to aid your ascent.</p>
            <div className="flex-1 flex flex-col gap-4">
              
              {/* Max HP Upgrade */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-green-400">Vitality Core</h4>
                  <p className="text-sm text-neutral-400">+20 Max HP (Current: +{gameState.gadgets.maxHpBonus})</p>
                </div>
                <button
                  onClick={() => {
                    if (gameState.money >= 100) {
                      setGameState(prev => {
                        const newMoney = prev.money - 100;
                        const newGadgets = { ...prev.gadgets, maxHpBonus: prev.gadgets.maxHpBonus + 20 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_gadgets', JSON.stringify(newGadgets));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          gadgets: newGadgets,
                          hero: { ...prev.hero, maxHp: prev.hero.maxHp + 20, hp: prev.hero.hp + 20 }
                        };
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 100 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                  disabled={gameState.money < 100}
                >
                  Buy ($100)
                </button>
              </div>

              {/* Speed Upgrade */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-blue-400">Swift Boots</h4>
                  <p className="text-sm text-neutral-400">+10 Base Speed (Current: +{gameState.gadgets.speedBonus})</p>
                </div>
                <button
                  onClick={() => {
                    if (gameState.money >= 150) {
                      setGameState(prev => {
                        const newMoney = prev.money - 150;
                        const newGadgets = { ...prev.gadgets, speedBonus: prev.gadgets.speedBonus + 10 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_gadgets', JSON.stringify(newGadgets));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          gadgets: newGadgets,
                          hero: { ...prev.hero, speed: prev.hero.speed + 10 }
                        };
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 150 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                  disabled={gameState.money < 150}
                >
                  Buy ($150)
                </button>
              </div>

              {/* Money Multiplier */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-yellow-400">Golden Magnet</h4>
                  <p className="text-sm text-neutral-400">+10% Money Drops (Current: +{Math.round((gameState.gadgets.moneyMultiplier - 1) * 100)}%)</p>
                </div>
                <button
                  onClick={() => {
                    if (gameState.money >= 200) {
                      setGameState(prev => {
                        const newMoney = prev.money - 200;
                        const newGadgets = { ...prev.gadgets, moneyMultiplier: prev.gadgets.moneyMultiplier + 0.1 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_gadgets', JSON.stringify(newGadgets));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          gadgets: newGadgets
                        };
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 200 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                  disabled={gameState.money < 200}
                >
                  Buy ($200)
                </button>
              </div>

              {/* Pickup Radius Upgrade */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-blue-400">Magnetic Field</h4>
                  <p className="text-sm text-neutral-400">+20 Pickup Radius (Current: +{gameState.gadgets.pickupRadiusBonus})</p>
                </div>
                <button
                  onClick={() => {
                    if (gameState.money >= 150) {
                      setGameState(prev => {
                        const newMoney = prev.money - 150;
                        const newGadgets = { ...prev.gadgets, pickupRadiusBonus: prev.gadgets.pickupRadiusBonus + 20 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_gadgets', JSON.stringify(newGadgets));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          gadgets: newGadgets
                        };
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 150 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                  disabled={gameState.money < 150}
                >
                  Buy ($150)
                </button>
              </div>

              {/* Cooldown Reduction */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-purple-400">Chronos Watch</h4>
                  <p className="text-sm text-neutral-400">+5% Cooldown Reduction (Current: {Math.round(gameState.gadgets.cooldownReduction * 100)}%)</p>
                </div>
                <button
                  onClick={() => {
                    if (gameState.money >= 300 && gameState.gadgets.cooldownReduction < 0.5) {
                      setGameState(prev => {
                        const newMoney = prev.money - 300;
                        const newGadgets = { ...prev.gadgets, cooldownReduction: prev.gadgets.cooldownReduction + 0.05 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_gadgets', JSON.stringify(newGadgets));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          gadgets: newGadgets
                        };
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 300 && gameState.gadgets.cooldownReduction < 0.5 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                  disabled={gameState.money < 300 || gameState.gadgets.cooldownReduction >= 0.5}
                >
                  {gameState.gadgets.cooldownReduction >= 0.5 ? 'Maxed' : 'Buy ($300)'}
                </button>
              </div>

              {/* Critical Chance */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-red-400">Assassin&apos;s Mark</h4>
                  <p className="text-sm text-neutral-400">+5% Critical Chance (Current: {Math.round(gameState.gadgets.critChance * 100)}%)</p>
                </div>
                <button
                  onClick={() => {
                    if (gameState.money >= 250 && gameState.gadgets.critChance < 0.5) {
                      setGameState(prev => {
                        const newMoney = prev.money - 250;
                        const newGadgets = { ...prev.gadgets, critChance: prev.gadgets.critChance + 0.05 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_gadgets', JSON.stringify(newGadgets));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          gadgets: newGadgets
                        };
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 250 && gameState.gadgets.critChance < 0.5 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                  disabled={gameState.money < 250 || gameState.gadgets.critChance >= 0.5}
                >
                  {gameState.gadgets.critChance >= 0.5 ? 'Maxed' : 'Buy ($250)'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Items Tab */}
        {shopTab === 'items' && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-2xl font-bold mb-2 text-white text-left">Items</h3>
            <p className="text-sm text-neutral-400 text-left mb-6">Purchase consumables and permanent upgrades.</p>
            <div className="flex-1 flex flex-col gap-4">
              
              {/* Item - Health Potion */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-red-400">Health Potion</h4>
                  <p className="text-sm text-neutral-400">Restores 50 HP. Press [1] to use.</p>
                  <p className="text-xs text-neutral-500 mt-1">Owned: {gameState.inventory.healthPotions}</p>
                </div>
                <button
                  onClick={() => {
                    const cost = 100;
                    if (gameState.money >= cost) {
                      setGameState(prev => {
                        const newMoney = prev.money - cost;
                        const newInventory = { ...prev.inventory, healthPotions: prev.inventory.healthPotions + 1 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_inventory', JSON.stringify(newInventory));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          inventory: newInventory
                        };
                      });
                    }
                  }}
                  disabled={gameState.money < 100}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 100 ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                >
                  Buy ($100)
                </button>
              </div>

              {/* Item - Attack Potion */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-orange-400">Attack Boost Potion</h4>
                  <p className="text-sm text-neutral-400">Doubles damage for 10 seconds. Press [2] to use.</p>
                  <p className="text-xs text-neutral-500 mt-1">Owned: {gameState.inventory.attackPotions}</p>
                </div>
                <button
                  onClick={() => {
                    const cost = 150;
                    if (gameState.money >= cost) {
                      setGameState(prev => {
                        const newMoney = prev.money - cost;
                        const newInventory = { ...prev.inventory, attackPotions: prev.inventory.attackPotions + 1 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_inventory', JSON.stringify(newInventory));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          inventory: newInventory
                        };
                      });
                    }
                  }}
                  disabled={gameState.money < 150}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 150 ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                >
                  Buy ($150)
                </button>
              </div>

              {/* Item - Armor Upgrade */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-blue-400">Armor Upgrade</h4>
                  <p className="text-sm text-neutral-400">Permanently reduces incoming damage by 5.</p>
                  <p className="text-xs text-neutral-500 mt-1">Owned: {gameState.inventory.armorUpgrades}</p>
                </div>
                <button
                  onClick={() => {
                    const cost = 200;
                    if (gameState.money >= cost) {
                      setGameState(prev => {
                        const newMoney = prev.money - cost;
                        const newInventory = { ...prev.inventory, armorUpgrades: prev.inventory.armorUpgrades + 1 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_inventory', JSON.stringify(newInventory));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          inventory: newInventory,
                          hero: { ...prev.hero, armor: prev.hero.armor + 5 }
                        };
                      });
                    }
                  }}
                  disabled={gameState.money < 200}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 200 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                >
                  Buy ($200)
                </button>
              </div>

              {/* Item - Mana Potion */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-blue-300">Mana Potion</h4>
                  <p className="text-sm text-neutral-400">Restores 50 Mana. Use with [3].</p>
                  <p className="text-xs text-neutral-500 mt-1">Owned: {gameState.inventory.manaPotions}</p>
                </div>
                <button
                  onClick={() => {
                    const cost = 100;
                    if (gameState.money >= cost) {
                      setGameState(prev => {
                        const newMoney = prev.money - cost;
                        const newInventory = { ...prev.inventory, manaPotions: prev.inventory.manaPotions + 1 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_inventory', JSON.stringify(newInventory));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          inventory: newInventory
                        };
                      });
                    }
                  }}
                  disabled={gameState.money < 100}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 100 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                >
                  Buy ($100)
                </button>
              </div>

              {/* Item - Invulnerability Potion */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-yellow-300">Invulnerability Potion</h4>
                  <p className="text-sm text-neutral-400">Grants invulnerability for 5 seconds. Use with [4].</p>
                  <p className="text-xs text-neutral-500 mt-1">Owned: {gameState.inventory.invulnerabilityPotions}</p>
                </div>
                <button
                  onClick={() => {
                    const cost = 300;
                    if (gameState.money >= cost) {
                      setGameState(prev => {
                        const newMoney = prev.money - cost;
                        const newInventory = { ...prev.inventory, invulnerabilityPotions: prev.inventory.invulnerabilityPotions + 1 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_inventory', JSON.stringify(newInventory));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          inventory: newInventory
                        };
                      });
                    }
                  }}
                  disabled={gameState.money < 300}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 300 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                >
                  Buy ($300)
                </button>
              </div>

              {/* Item - Max Mana Upgrade */}
              <div className="p-4 rounded-lg border bg-neutral-800 border-neutral-700 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-indigo-400">Max Mana Upgrade</h4>
                  <p className="text-sm text-neutral-400">Permanently increases Max Mana by 20.</p>
                  <p className="text-xs text-neutral-500 mt-1">Owned: {gameState.inventory.maxManaUpgrades}</p>
                </div>
                <button
                  onClick={() => {
                    const cost = 200;
                    if (gameState.money >= cost) {
                      setGameState(prev => {
                        const newMoney = prev.money - cost;
                        const newInventory = { ...prev.inventory, maxManaUpgrades: prev.inventory.maxManaUpgrades + 1 };
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('hero_ascent_money', newMoney.toString());
                          localStorage.setItem('hero_ascent_inventory', JSON.stringify(newInventory));
                        }
                        return {
                          ...prev,
                          money: newMoney,
                          inventory: newInventory,
                          hero: { ...prev.hero, maxMana: prev.hero.maxMana + 20, mana: prev.hero.mana + 20 }
                        };
                      });
                    }
                  }}
                  disabled={gameState.money < 200}
                  className={`px-4 py-2 rounded font-bold ${gameState.money >= 200 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                >
                  Buy ($200)
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
      {/* Button to go back to the pause menu */}
      <button onClick={() => setGameState(prev => ({ ...prev, status: 'paused' }))} className="px-8 py-3 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg font-semibold transition-colors">Back to Menu</button>
    </motion.div>
  );
}
