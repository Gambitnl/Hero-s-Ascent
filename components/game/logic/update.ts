import { GameState, Projectile, Monster, MoneyDrop } from '../types';
import { getId } from '../utils/id';
import { applyLevelUp } from './levelUp';

export const update = (state: GameState, dt: number) => {
      
      if (state.status !== 'playing') return;

      const { hero, abilities, barbarianAbilities, teleporterAbilities, keys, mousePos, mouseDown, archetype } = state;

      // Mana Regen & Timers
      hero.mana = Math.min(hero.maxMana, hero.mana + 5 * dt);
      if (state.potionCooldown > 0) state.potionCooldown -= dt;
      if (state.attackBoostTimer > 0) state.attackBoostTimer -= dt;
      if (state.invulnerabilityTimer > 0) state.invulnerabilityTimer -= dt;
      if (state.bossMessageTimer > 0) state.bossMessageTimer -= dt;

      if (abilities.arrowRainTimer > 0) abilities.arrowRainTimer -= dt;
      if (abilities.loveArrowTimer > 0) abilities.loveArrowTimer -= dt;

      // Arrow Rain Active Effect
      if (state.archetype === 'archer' && state.abilities.arrowRainActiveTimer !== undefined && state.abilities.arrowRainActiveTimer > 0) {
        state.abilities.arrowRainActiveTimer -= dt;
        // Spawn random arrows
        if (Math.random() < 0.4) {
          const x = Math.random() * state.canvasWidth;
          const y = Math.random() * state.canvasHeight;
          state.projectiles.push({
            id: getId(),
            pos: { x, y: -50 },
            vel: { x: (Math.random() - 0.5) * 50, y: 600 },
            radius: 4,
            damage: abilities.damage * 0.5,
            pierceCount: 0,
            maxPierce: 1,
            hitMonsters: new Set(),
            isArrow: true,
          });
        }
      }

      // Potion Usage
      if (keys['1'] && state.inventory.healthPotions > 0 && state.potionCooldown <= 0) {
        hero.hp = Math.min(hero.maxHp, hero.hp + 50);
        state.inventory.healthPotions--;
        state.potionCooldown = 1;
      }
      if (keys['2'] && state.inventory.attackPotions > 0 && state.potionCooldown <= 0) {
        state.attackBoostTimer = 10;
        state.inventory.attackPotions--;
        state.potionCooldown = 1;
      }
      if (keys['3'] && state.inventory.manaPotions > 0 && state.potionCooldown <= 0) {
        hero.mana = Math.min(hero.maxMana, hero.mana + 50);
        state.inventory.manaPotions--;
        state.potionCooldown = 1;
      }
      if (keys['4'] && state.inventory.invulnerabilityPotions > 0 && state.potionCooldown <= 0) {
        state.invulnerabilityTimer = 5;
        state.inventory.invulnerabilityPotions--;
        state.potionCooldown = 1;
      }

      // 1. Hero Movement
      const isCrit = Math.random() < state.gadgets.critChance;
      const critMultiplier = isCrit ? 2 : 1;
      const damageMultiplier = state.attackBoostTimer > 0 ? 2 : 1;
      
      let dx = 0;
      let dy = 0;
      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      if (archetype === 'barbarian' && barbarianAbilities.isDashing) {
        barbarianAbilities.dashTimer += dt;
        if (barbarianAbilities.dashTimer >= barbarianAbilities.dashDuration || !barbarianAbilities.dashTarget) {
          barbarianAbilities.isDashing = false;
        } else {
          const dashProgress = barbarianAbilities.dashTimer / barbarianAbilities.dashDuration;
          const dashSpeed = 800; // Fast dash
          const dashDx = barbarianAbilities.dashTarget.x - hero.pos.x;
          const dashDy = barbarianAbilities.dashTarget.y - hero.pos.y;
          const dashLen = Math.sqrt(dashDx * dashDx + dashDy * dashDy);
          if (dashLen > 0) {
            hero.pos.x += (dashDx / dashLen) * dashSpeed * dt;
            hero.pos.y += (dashDy / dashLen) * dashSpeed * dt;
          }
          
          // Damage enemies passed through
          for (const m of state.monsters) {
            const mdx = hero.pos.x - m.pos.x;
            const mdy = hero.pos.y - m.pos.y;
            const dist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (dist < hero.radius + m.radius + 20) {
              m.hp -= barbarianAbilities.rageDashDamage * dt * 10 * damageMultiplier * critMultiplier; // Apply damage over time during dash
            }
          }
        }
      } else {
        if (dx !== 0 || dy !== 0) {
          const len = Math.sqrt(dx * dx + dy * dy);
          hero.pos.x += (dx / len) * abilities.speed * dt;
          hero.pos.y += (dy / len) * abilities.speed * dt;
        }
      }

      // Clamp to screen
      hero.pos.x = Math.max(hero.radius, Math.min(state.canvasWidth - hero.radius, hero.pos.x));
      hero.pos.y = Math.max(hero.radius, Math.min(state.canvasHeight - hero.radius, hero.pos.y));

      // 2. Attacks
      const now = performance.now() / 1000;
      
      if (archetype === 'archer') {
        if (now - hero.lastAttackTime >= 1 / abilities.fireRate) {
          const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
          const projSpeed = 400;

          const newProjectiles: Projectile[] = [];
          
          // Secondary Attack (Right Click)
          if (mouseDown.right && hero.mana >= 15) {
            hero.lastAttackTime = now;
            hero.mana -= 15;
            const moveAngle = (dx !== 0 || dy !== 0) ? Math.atan2(dy, dx) : angleToMouse;
            const angles = [moveAngle, moveAngle + Math.PI];
            
            for (const baseAngle of angles) {
              const count = abilities.projectileCount;
              const startAngle = baseAngle - (abilities.spreadAngle * (count - 1)) / 2;
              for (let i = 0; i < count; i++) {
                const angle = count === 1 ? baseAngle : startAngle + i * abilities.spreadAngle;
                newProjectiles.push({
                  id: getId(),
                  pos: { x: hero.pos.x, y: hero.pos.y },
                  vel: { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed },
                  radius: 5,
                  damage: abilities.damage * damageMultiplier * critMultiplier,
                  pierceCount: 0,
                  maxPierce: abilities.maxPierce,
                  hitMonsters: new Set(),
                  isArrow: true,
                });
              }
            }
          } else if (mouseDown.left) {
            // Primary Attack (Left Click)
            hero.lastAttackTime = now;
            const count = abilities.projectileCount;
            const startAngle = angleToMouse - (abilities.spreadAngle * (count - 1)) / 2;
            for (let i = 0; i < count; i++) {
              const angle = count === 1 ? angleToMouse : startAngle + i * abilities.spreadAngle;
              newProjectiles.push({
                id: getId(),
                pos: { x: hero.pos.x, y: hero.pos.y },
                vel: { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed },
                radius: 5,
                damage: abilities.damage * damageMultiplier * critMultiplier,
                pierceCount: 0,
                maxPierce: abilities.maxPierce,
                hitMonsters: new Set(),
                isArrow: true,
              });
            }
          }
          state.projectiles.push(...newProjectiles);
        }

        // Archer Q: Arrow Rain
        if (keys['q'] && abilities.arrowRainTimer <= 0 && hero.mana >= 30) {
          hero.mana -= 30;
          abilities.arrowRainTimer = abilities.arrowRainCooldown;
          abilities.arrowRainActiveTimer = 5;
        }

        // Archer E: Love Arrow
        if (keys['e'] && abilities.loveArrowTimer <= 0 && hero.mana >= 25) {
          hero.mana -= 25;
          abilities.loveArrowTimer = abilities.loveArrowCooldown;
          const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
          const projSpeed = 600;
          state.projectiles.push({
            id: getId(),
            pos: { x: hero.pos.x, y: hero.pos.y },
            vel: { x: Math.cos(angleToMouse) * projSpeed, y: Math.sin(angleToMouse) * projSpeed },
            radius: 8,
            damage: 5,
            pierceCount: 0,
            maxPierce: 1,
            hitMonsters: new Set(),
            isLoveArrow: true,
          });
        }
      } else if (archetype === 'barbarian') {
        // Update cooldowns
        if (barbarianAbilities.sweepingStrikeTimer > 0) barbarianAbilities.sweepingStrikeTimer -= dt;
        if (barbarianAbilities.sweepingRoundTimer > 0) barbarianAbilities.sweepingRoundTimer -= dt;
        if (barbarianAbilities.ruptureTimer > 0) barbarianAbilities.ruptureTimer -= dt;
        if (barbarianAbilities.rageDashTimer > 0) barbarianAbilities.rageDashTimer -= dt;

        // Sweeping Strike (LMB)
        if (mouseDown.left && barbarianAbilities.sweepingStrikeTimer <= 0) {
          barbarianAbilities.sweepingStrikeTimer = barbarianAbilities.sweepingStrikeCooldown;
          const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
          const range = 80;
          const arc = Math.PI / 2; // 90 degrees

          state.effects.push({
            id: getId(),
            type: 'slash',
            pos: { ...hero.pos },
            angle: angleToMouse,
            radius: range,
            timer: 0,
            maxTimer: 0.2,
          });

          for (const m of state.monsters) {
            const dx = m.pos.x - hero.pos.x;
            const dy = m.pos.y - hero.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= range + m.radius) {
              const angleToMonster = Math.atan2(dy, dx);
              let angleDiff = angleToMonster - angleToMouse;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
              
              if (Math.abs(angleDiff) <= arc / 2) {
                m.hp -= barbarianAbilities.sweepingStrikeDamage * damageMultiplier * critMultiplier;
              }
            }
          }
        }

        // Sweeping Round (RMB)
        if (mouseDown.right && barbarianAbilities.sweepingRoundTimer <= 0 && hero.mana >= 10) {
          hero.mana -= 10;
          barbarianAbilities.sweepingRoundTimer = barbarianAbilities.sweepingRoundCooldown;
          const range = 120;

          state.effects.push({
            id: getId(),
            type: 'circle',
            pos: { ...hero.pos },
            radius: range,
            timer: 0,
            maxTimer: 0.3,
          });

          for (const m of state.monsters) {
            const dx = m.pos.x - hero.pos.x;
            const dy = m.pos.y - hero.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= range + m.radius) {
              m.hp -= barbarianAbilities.sweepingRoundDamage * damageMultiplier * critMultiplier;
            }
          }
        }

        // Rupture (Q)
        if (keys['q'] && barbarianAbilities.ruptureTimer <= 0 && hero.mana >= 20) {
          hero.mana -= 20;
          barbarianAbilities.ruptureTimer = barbarianAbilities.ruptureCooldown;
          const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
          const length = 500;
          const endPos = {
            x: hero.pos.x + Math.cos(angleToMouse) * length,
            y: hero.pos.y + Math.sin(angleToMouse) * length,
          };

          state.rupturePaths.push({
            id: getId(),
            start: { ...hero.pos },
            end: endPos,
            timer: 6,
            damage: barbarianAbilities.ruptureDamage * damageMultiplier,
          });

          state.effects.push({
            id: getId(),
            type: 'rupture',
            pos: { ...hero.pos },
            angle: angleToMouse,
            radius: length,
            timer: 0,
            maxTimer: 0.4,
          });

          // Initial burst damage
          for (const m of state.monsters) {
            // Distance from point to line segment
            const l2 = length * length;
            let t = ((m.pos.x - hero.pos.x) * (endPos.x - hero.pos.x) + (m.pos.y - hero.pos.y) * (endPos.y - hero.pos.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            const projX = hero.pos.x + t * (endPos.x - hero.pos.x);
            const projY = hero.pos.y + t * (endPos.y - hero.pos.y);
            const dist = Math.sqrt((m.pos.x - projX) ** 2 + (m.pos.y - projY) ** 2);

            if (dist <= m.radius + 30) {
              m.hp -= barbarianAbilities.ruptureDamage * damageMultiplier * critMultiplier;
            }
          }
        }

        // Rage Dash (E)
        if (keys['e'] && barbarianAbilities.rageDashTimer <= 0 && !barbarianAbilities.isDashing && hero.mana >= 15) {
          hero.mana -= 15;
          barbarianAbilities.rageDashTimer = barbarianAbilities.rageDashCooldown;
          barbarianAbilities.isDashing = true;
          barbarianAbilities.dashTimer = 0;
          
          const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
          const dashDist = 600;
          barbarianAbilities.dashTarget = {
            x: hero.pos.x + Math.cos(angleToMouse) * dashDist,
            y: hero.pos.y + Math.sin(angleToMouse) * dashDist,
          };

          state.effects.push({
            id: getId(),
            type: 'dash',
            pos: { ...hero.pos },
            angle: angleToMouse,
            timer: 0,
            maxTimer: barbarianAbilities.dashDuration,
          });
        }
      } else if (archetype === 'teleporter') {
        // Update cooldowns
        if (teleporterAbilities.boomerangTimer > 0) teleporterAbilities.boomerangTimer -= dt;
        if (teleporterAbilities.blackHoleTimer > 0) teleporterAbilities.blackHoleTimer -= dt;
        if (teleporterAbilities.dimensionDoorTimer > 0) teleporterAbilities.dimensionDoorTimer -= dt;
        if (teleporterAbilities.teleportAllyTimer > 0) teleporterAbilities.teleportAllyTimer -= dt;

        // Black Boomerang (LMB)
        if (mouseDown.left && teleporterAbilities.boomerangTimer <= 0) {
          teleporterAbilities.boomerangTimer = teleporterAbilities.boomerangCooldown;
          const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
          const projSpeed = 400;
          const damage = teleporterAbilities.boomerangDamage * Math.pow(0.9, teleporterAbilities.boomerangCount - 1) * damageMultiplier * critMultiplier;
          
          const count = teleporterAbilities.boomerangCount;
          const spreadAngle = Math.PI / 12; // 15 degrees spread
          
          for (let i = 0; i < count; i++) {
            const angleOffset = (i - (count - 1) / 2) * spreadAngle;
            const angle = angleToMouse + angleOffset;
            
            // Calculate target position based on mouse distance, but rotated
            const distToMouse = Math.sqrt((mousePos.x - hero.pos.x)**2 + (mousePos.y - hero.pos.y)**2);
            const targetX = hero.pos.x + Math.cos(angle) * distToMouse;
            const targetY = hero.pos.y + Math.sin(angle) * distToMouse;
            
            state.projectiles.push({
              id: getId(),
              pos: { ...hero.pos },
              vel: { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed },
              radius: 10,
              damage: damage,
              pierceCount: 0,
              maxPierce: 9999, // Boomerangs pierce infinitely
              hitMonsters: new Set(),
              isBoomerang: true,
              targetPos: { x: targetX, y: targetY },
              returning: false,
            });
          }
        }

        // Black Bolt (RMB)
        if (mouseDown.right && teleporterAbilities.blackHoleTimer <= 0 && hero.mana >= 20) {
          hero.mana -= 20;
          teleporterAbilities.blackHoleTimer = teleporterAbilities.blackHoleCooldown;
          
          state.effects.push({
            id: getId(),
            type: 'blackHole',
            pos: { ...mousePos },
            radius: teleporterAbilities.blackHoleRadius,
            timer: 0,
            maxTimer: teleporterAbilities.blackHoleDuration,
          });
        }

        // Dimension Doors (Q)
        if (keys['q'] && teleporterAbilities.dimensionDoorTimer <= 0 && hero.mana >= 30) {
          hero.mana -= 30;
          teleporterAbilities.dimensionDoorTimer = teleporterAbilities.dimensionDoorCooldown;
          
          const blastRadius = 150;
          const newPos = { ...mousePos };
          
          // Clamp new position to screen
          newPos.x = Math.max(hero.radius, Math.min(state.canvasWidth - hero.radius, newPos.x));
          newPos.y = Math.max(hero.radius, Math.min(state.canvasHeight - hero.radius, newPos.y));
          
          hero.pos = newPos;

          state.effects.push({
            id: getId(),
            type: 'circle',
            pos: { ...newPos },
            radius: blastRadius,
            timer: 0,
            maxTimer: 0.5,
          });

          for (const m of state.monsters) {
            if (m.isFriendly) continue;
            const dx = m.pos.x - newPos.x;
            const dy = m.pos.y - newPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const pushAngle = Math.atan2(dy, dx);
            const pushDist = Math.max(state.canvasWidth, state.canvasHeight); // Push to edge
            
            if (dist <= blastRadius + m.radius) {
              m.hp -= teleporterAbilities.dimensionDoorDamage * damageMultiplier * critMultiplier;
            }
            
            // Push all monsters to edge
            m.pos.x += Math.cos(pushAngle) * pushDist;
            m.pos.y += Math.sin(pushAngle) * pushDist;
            
            // Clamp to screen
            m.pos.x = Math.max(m.radius, Math.min(state.canvasWidth - m.radius, m.pos.x));
            m.pos.y = Math.max(m.radius, Math.min(state.canvasHeight - m.radius, m.pos.y));
          }
        }

        // Teleport Ally (E)
        if (keys['e'] && teleporterAbilities.teleportAllyTimer <= 0 && hero.mana >= 40) {
          hero.mana -= 40;
          teleporterAbilities.teleportAllyTimer = teleporterAbilities.teleportAllyCooldown;
          
          const allies = [
            { type: 'Gargantua', hp: 1000, damage: 50, speed: 30, radius: 25, color: '#064e3b' },
            { type: 'Shadow Weaver', hp: 200, damage: 100, speed: 120, radius: 12, color: '#312e81' },
            { type: 'Arcane Turret', hp: 300, damage: 20, speed: 0, radius: 15, color: '#0284c7' },
            { type: 'Light Spirit', hp: 200, damage: 0, speed: 80, radius: 10, color: '#fef08a' },
            { type: 'Void Fiend', hp: 100, damage: 200, speed: 90, radius: 12, color: '#4c1d95' },
          ];
          
          const allyDef = allies[Math.floor(Math.random() * allies.length)];
          
          state.monsters.push({
            id: getId(),
            pos: { ...mousePos },
            radius: allyDef.radius,
            speed: allyDef.speed,
            hp: allyDef.hp,
            maxHp: allyDef.hp,
            damage: allyDef.damage,
            color: allyDef.color,
            isFriendly: true,
            allyType: allyDef.type,
            expireTimer: 30, // Allies last 30 seconds
            attackTimer: 0,
          });
          
          state.effects.push({
            id: getId(),
            type: 'circle',
            pos: { ...mousePos },
            radius: 30,
            timer: 0,
            maxTimer: 0.5,
          });
        }
      }

      // 3. Update Projectiles
      for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const p = state.projectiles[i];
        
        if (p.isBoomerang && p.targetPos) {
          const projSpeed = 400;
          
          if (!p.returning) {
            // Move towards targetPos
            // Guide slightly towards mousePos
            const guideSpeed = 2;
            p.targetPos.x += (mousePos.x - p.targetPos.x) * guideSpeed * dt;
            p.targetPos.y += (mousePos.y - p.targetPos.y) * guideSpeed * dt;
            
            const dx = p.targetPos.x - p.pos.x;
            const dy = p.targetPos.y - p.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 20) {
              p.returning = true;
              p.hitMonsters.clear(); // Can hit again on return
            } else {
              p.vel.x = (dx / dist) * projSpeed;
              p.vel.y = (dy / dist) * projSpeed;
            }
          } else {
            // Move towards hero
            const dx = hero.pos.x - p.pos.x;
            const dy = hero.pos.y - p.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < hero.radius + p.radius) {
              state.projectiles.splice(i, 1);
              continue;
            } else {
              p.vel.x = (dx / dist) * projSpeed;
              p.vel.y = (dy / dist) * projSpeed;
            }
          }
        }

        p.pos.x += p.vel.x * dt;
        p.pos.y += p.vel.y * dt;

        // Remove if off screen (except boomerangs)
        if (!p.isBoomerang && (
          p.pos.x < -100 || p.pos.x > state.canvasWidth + 100 ||
          p.pos.y < -100 || p.pos.y > state.canvasHeight + 100
        )) {
          state.projectiles.splice(i, 1);
        }
      }

      // 4. Spawn Monsters
      state.spawnTimer += dt;
      if (state.monstersToSpawn > 0 && state.spawnTimer >= state.spawnInterval) {
        state.spawnTimer = 0;
        state.monstersToSpawn--;

        // Spawn at edges
        let x, y;
        if (Math.random() < 0.5) {
          x = Math.random() < 0.5 ? -20 : state.canvasWidth + 20;
          y = Math.random() * state.canvasHeight;
        } else {
          x = Math.random() * state.canvasWidth;
          y = Math.random() < 0.5 ? -20 : state.canvasHeight + 20;
        }

        if (state.level === 5 && state.monstersToSpawn === 0) {
          // Spawn Boss
          state.monsters.push({
            id: getId(),
            pos: { x: state.canvasWidth / 2, y: -50 },
            radius: 30,
            speed: 40,
            hp: 1500,
            maxHp: 1500,
            damage: 30,
            color: '#4c1d95', // Deep purple
            isBoss: true,
            attackTimer: 0,
          });
          state.bossMessageTimer = 5;
        } else {
          const rand = Math.random();
          let type: 'normal' | 'swarm' | 'tank' | 'ranged' = 'normal';
          
          if (state.level >= 2 && rand < 0.2) {
            type = 'swarm';
          } else if (state.level >= 3 && rand < 0.35) {
            type = 'tank';
          } else if (state.level >= 4 && rand < 0.5) {
            type = 'ranged';
          }

          let hp = 20 + state.level * 10;
          let speed = 50 + state.level * 5;
          let radius = 12 + Math.random() * 5;
          let damage = 10 + state.level * 2;
          let color = '#ef4444'; // Default red

          if (type === 'swarm') {
            hp = hp * 0.4;
            speed = speed * 1.5;
            radius = 8;
            damage = damage * 0.5;
            color = '#facc15'; // Yellow
          } else if (type === 'tank') {
            hp = hp * 3;
            speed = speed * 0.5;
            radius = 20;
            damage = damage * 1.5;
            color = '#475569'; // Slate
          } else if (type === 'ranged') {
            hp = hp * 0.8;
            speed = speed * 0.8;
            color = '#10b981'; // Emerald
          } else {
            const colors = ['#ef4444', '#f97316', '#8b5cf6', '#ec4899'];
            color = colors[(state.level - 1) % colors.length];
          }

          state.monsters.push({
            id: getId(),
            pos: { x, y },
            radius,
            speed,
            hp,
            maxHp: hp,
            damage,
            color,
            type,
            attackTimer: 0,
          });
          
          if (type === 'swarm') {
            // Spawn a few more nearby
            for(let i=0; i<3; i++) {
              state.monsters.push({
                id: getId(),
                pos: { x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 40 },
                radius,
                speed,
                hp,
                maxHp: hp,
                damage,
                color,
                type,
                attackTimer: 0,
              });
            }
          }
        }
      }

      // 5. Update Monsters & Collisions
      const charmedMonster = state.monsters.find(m => m.isCharmed);

      for (let i = state.monsters.length - 1; i >= 0; i--) {
        const m = state.monsters[i];
        
        if (m.expireTimer !== undefined) {
          m.expireTimer -= dt;
          if (m.expireTimer <= 0) {
            state.monsters.splice(i, 1);
            continue;
          }
        }

        // Target selection
        let targetPos = hero.pos;
        if (m.isCharmed || m.isFriendly) {
          // Find nearest non-charmed/non-friendly monster
          let nearestDist = Infinity;
          let nearestMonster = null;
          for (const other of state.monsters) {
            if (other.id === m.id || other.isCharmed || other.isFriendly) continue;
            const distToOther = Math.sqrt((other.pos.x - m.pos.x) ** 2 + (other.pos.y - m.pos.y) ** 2);
            if (distToOther < nearestDist) {
              nearestDist = distToOther;
              nearestMonster = other;
            }
          }
          if (nearestMonster) {
            targetPos = nearestMonster.pos;
          } else if (m.isFriendly) {
            // If friendly and no enemies, follow hero
            targetPos = hero.pos;
          }
        } else if (charmedMonster) {
          // Non-charmed monsters target the charmed one
          targetPos = charmedMonster.pos;
        } else {
          // Target nearest friendly or hero
          let nearestDist = Math.sqrt((hero.pos.x - m.pos.x) ** 2 + (hero.pos.y - m.pos.y) ** 2);
          targetPos = hero.pos;
          for (const other of state.monsters) {
            if (other.isFriendly) {
              const distToOther = Math.sqrt((other.pos.x - m.pos.x) ** 2 + (other.pos.y - m.pos.y) ** 2);
              if (distToOther < nearestDist) {
                nearestDist = distToOther;
                targetPos = other.pos;
              }
            }
          }
        }

        const dx = targetPos.x - m.pos.x;
        const dy = targetPos.y - m.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Ally specific logic
        if (m.isFriendly) {
          if (m.allyType === 'Arcane Turret') {
            m.attackTimer = (m.attackTimer || 0) + dt;
            if (m.attackTimer >= 1) {
              m.attackTimer = 0;
              if (dist > 0 && dist < 400 && targetPos !== hero.pos) {
                const angle = Math.atan2(dy, dx);
                state.projectiles.push({
                  id: getId(),
                  pos: { ...m.pos },
                  vel: { x: Math.cos(angle) * 300, y: Math.sin(angle) * 300 },
                  radius: 5,
                  damage: m.damage,
                  pierceCount: 0,
                  maxPierce: 1,
                  hitMonsters: new Set(),
                  isEnemy: false,
                });
              }
            }
          } else if (m.allyType === 'Light Spirit') {
            m.attackTimer = (m.attackTimer || 0) + dt;
            if (m.attackTimer >= 1) {
              m.attackTimer = 0;
              const heroDist = Math.sqrt((hero.pos.x - m.pos.x) ** 2 + (hero.pos.y - m.pos.y) ** 2);
              if (heroDist < 150) {
                hero.hp = Math.min(hero.maxHp, hero.hp + 10);
                state.damageTexts.push({
                  id: getId(),
                  pos: { x: hero.pos.x, y: hero.pos.y - 20 },
                  text: '+10',
                  timer: 1,
                  color: '#22c55e',
                });
              }
            }
            if (dist > 50) {
              m.pos.x += (dx / dist) * m.speed * dt;
              m.pos.y += (dy / dist) * m.speed * dt;
            }
          } else if (m.allyType === 'Void Fiend') {
            if (dist > 0 && targetPos !== hero.pos) {
              m.pos.x += (dx / dist) * m.speed * dt;
              m.pos.y += (dy / dist) * m.speed * dt;
            }
            if (dist < m.radius + 20 && targetPos !== hero.pos) {
              // Explode
              state.effects.push({
                id: getId(),
                type: 'circle',
                pos: { ...m.pos },
                radius: 100,
                timer: 0,
                maxTimer: 0.5,
              });
              for (const other of state.monsters) {
                if (other.isFriendly || other.isCharmed) continue;
                const odist = Math.sqrt((other.pos.x - m.pos.x) ** 2 + (other.pos.y - m.pos.y) ** 2);
                if (odist < 100 + other.radius) {
                  other.hp -= m.damage;
                  state.damageTexts.push({
                    id: getId(),
                    pos: { x: other.pos.x, y: other.pos.y - 20 },
                    text: Math.floor(m.damage).toString(),
                    timer: 1,
                    color: '#ffffff',
                  });
                }
              }
              m.hp = 0; // Kill self
            }
          } else if (dist > 0 && targetPos !== hero.pos) {
            m.pos.x += (dx / dist) * m.speed * dt;
            m.pos.y += (dy / dist) * m.speed * dt;
          } else if (dist > 100 && targetPos === hero.pos) {
            // Follow hero if no enemies
            m.pos.x += (dx / dist) * m.speed * dt;
            m.pos.y += (dy / dist) * m.speed * dt;
          }
        } else if (m.type === 'ranged') {
          // Ranged monsters try to stay at a distance
          if (dist > 200) {
            m.pos.x += (dx / dist) * m.speed * dt;
            m.pos.y += (dy / dist) * m.speed * dt;
          } else if (dist < 150) {
            // Back away
            m.pos.x -= (dx / dist) * m.speed * dt;
            m.pos.y -= (dy / dist) * m.speed * dt;
          }
          
          // Attack
          m.attackTimer = (m.attackTimer || 0) + dt;
          if (m.attackTimer >= 2) {
            m.attackTimer = 0;
            
            let attackTargetPos = hero.pos;
            let isEnemyProj = !m.isCharmed;
            
            if (m.isCharmed || m.isFriendly) {
              // Find nearest enemy monster
              let nearestEnemy = null;
              let minDist = Infinity;
              for (const other of state.monsters) {
                if (other.id === m.id || other.isCharmed || other.isFriendly) continue;
                const odist = Math.sqrt((other.pos.x - m.pos.x) ** 2 + (other.pos.y - m.pos.y) ** 2);
                if (odist < minDist) {
                  minDist = odist;
                  nearestEnemy = other;
                }
              }
              if (nearestEnemy) {
                attackTargetPos = nearestEnemy.pos;
                isEnemyProj = false;
              } else {
                // No enemies, don't shoot
                continue;
              }
            }
            
            const adx = attackTargetPos.x - m.pos.x;
            const ady = attackTargetPos.y - m.pos.y;
            const angle = Math.atan2(ady, adx);
            const projSpeed = 150;
            state.projectiles.push({
              id: getId(),
              pos: { x: m.pos.x, y: m.pos.y },
              vel: { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed },
              radius: 6,
              damage: m.damage,
              pierceCount: 0,
              maxPierce: 1,
              hitMonsters: new Set(),
              isEnemy: isEnemyProj,
            });
          }
        } else if (dist > 0) {
          m.pos.x += (dx / dist) * m.speed * dt;
          m.pos.y += (dy / dist) * m.speed * dt;
        }

        // Hero collision
        if (dist < hero.radius + m.radius && !m.isCharmed && !m.isFriendly) {
          if ((state.archetype !== 'barbarian' || !state.barbarianAbilities.isDashing) && state.invulnerabilityTimer <= 0) {
            const dmg = Math.max(1, m.damage - hero.armor) * dt;
            hero.hp -= dmg; // Continuous damage while touching
            
            if (Math.random() < 0.1) { // Throttle damage text for continuous damage
              state.damageTexts.push({
                id: getId(),
                pos: { x: hero.pos.x, y: hero.pos.y - 20 },
                text: Math.floor(dmg * 10).toString(),
                timer: 1,
                color: '#ef4444',
              });
            }

            if (hero.hp <= 0) {
              hero.hp = 0;
              state.status = 'game_over';
            }
          }
        }

        // Boss special attacks
        if (m.isBoss) {
          m.attackTimer = (m.attackTimer || 0) + dt;
          if (m.attackTimer > 3) {
            m.attackTimer = 0;
            // Shoot projectiles in a circle
            const projSpeed = 150;
            const newProjectiles: Projectile[] = [];
            for (let j = 0; j < 8; j++) {
              const angle = (j / 8) * Math.PI * 2;
              newProjectiles.push({
                id: getId(),
                pos: { x: m.pos.x, y: m.pos.y },
                vel: { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed },
                radius: 6,
                damage: 20,
                pierceCount: 0,
                maxPierce: 1,
                hitMonsters: new Set(),
                isEnemy: true,
              });
            }
            state.projectiles.push(...newProjectiles);
          }
        }

        // Projectile collision
        for (let j = state.projectiles.length - 1; j >= 0; j--) {
          const p = state.projectiles[j];
          
          let projectileHit = false;

          if (p.isEnemy) {
            // Check hero collision
            const pdx = p.pos.x - hero.pos.x;
            const pdy = p.pos.y - hero.pos.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

            if (pdist < p.radius + hero.radius) {
              if ((state.archetype !== 'barbarian' || !state.barbarianAbilities.isDashing) && state.invulnerabilityTimer <= 0) {
                const dmg = Math.max(1, p.damage - hero.armor);
                hero.hp -= dmg;
                state.damageTexts.push({
                  id: getId(),
                  pos: { x: hero.pos.x, y: hero.pos.y - 20 },
                  text: Math.floor(dmg).toString(),
                  timer: 1,
                  color: '#ef4444',
                });
                if (hero.hp <= 0) {
                  hero.hp = 0;
                  state.status = 'game_over';
                }
              }
              state.projectiles.splice(j, 1);
              projectileHit = true;
            }
          }

          if (projectileHit) continue;

          // Check monster collision
          if (p.hitMonsters.has(m.id)) continue;

          // If it's an enemy projectile, it should only hit charmed/friendly monsters or hero
          if (p.isEnemy && !m.isCharmed && !m.isFriendly) continue;
          // If it's a friendly projectile, it should only hit non-charmed/non-friendly monsters
          if (!p.isEnemy && (m.isCharmed || m.isFriendly) && !p.isLoveArrow) continue;

          const pdx = p.pos.x - m.pos.x;
          const pdy = p.pos.y - m.pos.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < p.radius + m.radius) {
            if (p.isLoveArrow) {
              if (!m.isBoss) {
                if (!m.isCharmed) {
                  m.isCharmed = true;
                  m.hp *= 10;
                  m.maxHp *= 10;
                  m.damage *= 10;
                }
              }
              state.projectiles.splice(j, 1);
              continue;
            }
            m.hp -= p.damage;
            state.damageTexts.push({
              id: getId(),
              pos: { x: m.pos.x, y: m.pos.y - 20 },
              text: Math.floor(p.damage).toString(),
              timer: 1,
              color: p.isEnemy ? '#ef4444' : '#ffffff',
            });
            p.hitMonsters.add(m.id);
            p.pierceCount++;

            if (p.pierceCount >= p.maxPierce) {
              state.projectiles.splice(j, 1);
            }
          }
        }

        // Charmed/Friendly monster damage to others
        if (m.isCharmed || m.isFriendly) {
          for (const other of state.monsters) {
            if (other.id === m.id || other.isCharmed || other.isFriendly) continue;
            const odx = other.pos.x - m.pos.x;
            const ody = other.pos.y - m.pos.y;
            const odist = Math.sqrt(odx * odx + ody * ody);
            if (odist < m.radius + other.radius) {
              other.hp -= m.damage * dt; // Charmed/Friendly monster deals damage to others
              m.hp -= other.damage * dt; // Others deal damage back
              
              if (Math.random() < 0.1) { // Throttle damage text
                state.damageTexts.push({
                  id: getId(),
                  pos: { x: other.pos.x, y: other.pos.y - 20 },
                  text: Math.floor(m.damage * dt * 10).toString(),
                  timer: 1,
                  color: '#ffffff',
                });
              }
            }
          }
        }

        // Check if monster died
        if (m.hp <= 0) {
          if (m.isBoss) {
            state.score += 1000 * state.level;
            const amount = Math.floor(500 * state.gadgets.moneyMultiplier);
            state.moneyDrops.push({
              id: getId(),
              pos: { x: m.pos.x, y: m.pos.y },
              amount,
              radius: 15,
            });
          } else {
            state.score += 10 * state.level;
            // Spawn money drop
            const amount = Math.floor((Math.floor(Math.random() * 10) + 1) * state.gadgets.moneyMultiplier);
            state.moneyDrops.push({
              id: getId(),
              pos: { x: m.pos.x, y: m.pos.y },
              amount,
              radius: 6,
            });
          }

          state.monsters.splice(i, 1);
        }
      }

      // 5.1 Resolve Overlaps (Solid Bodies)
      for (let i = 0; i < state.monsters.length; i++) {
        const m1 = state.monsters[i];
        
        // Push apart from other monsters
        for (let j = i + 1; j < state.monsters.length; j++) {
          const m2 = state.monsters[j];
          let dx = m2.pos.x - m1.pos.x;
          let dy = m2.pos.y - m1.pos.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = m1.radius + m2.radius;
          
          if (dist === 0) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            dist = Math.sqrt(dx * dx + dy * dy);
          }

          if (dist < minDist) {
            const overlap = minDist - dist;
            const pushX = (dx / dist) * overlap * 0.5;
            const pushY = (dy / dist) * overlap * 0.5;
            m1.pos.x -= pushX;
            m1.pos.y -= pushY;
            m2.pos.x += pushX;
            m2.pos.y += pushY;
          }
        }
        
        // Push apart from hero
        let dx = hero.pos.x - m1.pos.x;
        let dy = hero.pos.y - m1.pos.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = hero.radius + m1.radius;

        if (dist === 0) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          dist = Math.sqrt(dx * dx + dy * dy);
        }

        if (dist < minDist) {
          const overlap = minDist - dist;
          // Push both equally
          const pushX = (dx / dist) * overlap * 0.5;
          const pushY = (dy / dist) * overlap * 0.5;
          
          hero.pos.x += pushX;
          hero.pos.y += pushY;
          m1.pos.x -= pushX;
          m1.pos.y -= pushY;
        }

        // Clamp monster to screen

        m1.pos.x = Math.max(m1.radius, Math.min(state.canvasWidth - m1.radius, m1.pos.x));
        m1.pos.y = Math.max(m1.radius, Math.min(state.canvasHeight - m1.radius, m1.pos.y));
      }

      // Clamp hero to screen again after resolving overlaps
      hero.pos.x = Math.max(hero.radius, Math.min(state.canvasWidth - hero.radius, hero.pos.x));
      hero.pos.y = Math.max(hero.radius, Math.min(state.canvasHeight - hero.radius, hero.pos.y));

      // 5.5 Update Money Drops & Collisions
      for (let i = state.moneyDrops.length - 1; i >= 0; i--) {
        const drop = state.moneyDrops[i];
        const dx = hero.pos.x - drop.pos.x;
        const dy = hero.pos.y - drop.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < hero.radius + drop.radius + state.gadgets.pickupRadiusBonus) {
          state.money += drop.amount;
          state.moneyDrops.splice(i, 1);
          if (typeof window !== 'undefined') {
            localStorage.setItem('hero_ascent_money', state.money.toString());
          }
        }
      }

      // 6. Update Effects
      for (let i = state.effects.length - 1; i >= 0; i--) {
        const effect = state.effects[i];
        effect.timer += dt;
        
        if (effect.type === 'blackHole' && effect.radius) {
          // Black hole logic
          for (const m of state.monsters) {
            if (m.isFriendly) continue;
            
            const dx = effect.pos.x - m.pos.x;
            const dy = effect.pos.y - m.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < effect.radius * 0.3) {
              // Instant kill inside core
              if (!m.isBoss) {
                m.hp = 0;
                // No money drop for black hole kills
                m.isBoss = false; // Hack to prevent boss money drop if it was a boss (but bosses are immune)
              }
            } else if (dist < effect.radius) {
              // Slow and damage near
              m.speed = Math.max(10, m.speed - 100 * dt);
              m.hp -= 5 * dt;
              
              // Pull towards center
              m.pos.x += (dx / dist) * 50 * dt;
              m.pos.y += (dy / dist) * 50 * dt;
            }
          }
        }

        if (effect.timer >= effect.maxTimer) {
          state.effects.splice(i, 1);
        }
      }

      // 7. Update Rupture Paths
      for (let i = state.rupturePaths.length - 1; i >= 0; i--) {
        const path = state.rupturePaths[i];
        path.timer -= dt;
        if (path.timer <= 0) {
          state.rupturePaths.splice(i, 1);
        } else {
          // Damage and slow enemies on the path
          for (const m of state.monsters) {
            if (m.isFriendly) continue;
            const l2 = (path.end.x - path.start.x) ** 2 + (path.end.y - path.start.y) ** 2;
            let t = ((m.pos.x - path.start.x) * (path.end.x - path.start.x) + (m.pos.y - path.start.y) * (path.end.y - path.start.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            const projX = path.start.x + t * (path.end.x - path.start.x);
            const projY = path.start.y + t * (path.end.y - path.start.y);
            const dist = Math.sqrt((m.pos.x - projX) ** 2 + (m.pos.y - projY) ** 2);

            if (dist <= m.radius + 30) {
              m.hp -= (path.damage * 0.2) * dt; // Continuous small damage
              m.speed = Math.max(10, m.speed - 50 * dt); // Slow down
            }
          }
        }
      }

      // 8. Update Damage Texts
      for (let i = state.damageTexts.length - 1; i >= 0; i--) {
        const dtText = state.damageTexts[i];
        dtText.timer -= dt;
        dtText.pos.y -= 20 * dt; // Float up
        if (dtText.timer <= 0) {
          state.damageTexts.splice(i, 1);
        }
      }

      // 6. Check Level Complete
      if (state.monstersToSpawn === 0 && state.monsters.filter(m => !m.isCharmed && !m.isFriendly).length === 0) {
        state.status = 'level_complete';
        applyLevelUp(state);
      }

      // Force re-render by creating a new state object reference
      
    };

    