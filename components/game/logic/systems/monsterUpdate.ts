
import { GameState, Projectile } from '../../types';
import { getId } from '../../utils/id';

export const updateMonsters = (state: GameState, dt: number) => {
  const { hero } = state;
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
    const currentSpeed = m.isInert ? 0 : m.speed;
    if (m.isFriendly) {
      if (m.allyType === 'Arcane Turret') {
        m.attackTimer = (m.attackTimer || 0) + dt;
        if (m.attackTimer >= 1 && !m.isStopAttacking) {
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
        if (m.attackTimer >= 1 && !m.isStopAttacking) {
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
          m.pos.x += (dx / dist) * currentSpeed * dt;
          m.pos.y += (dy / dist) * currentSpeed * dt;
        }
      } else if (m.allyType === 'Void Fiend') {
        if (dist > 0 && targetPos !== hero.pos) {
          m.pos.x += (dx / dist) * currentSpeed * dt;
          m.pos.y += (dy / dist) * currentSpeed * dt;
        }
        if (dist < m.radius + 20 && targetPos !== hero.pos && !m.isStopAttacking) {
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
        m.pos.x += (dx / dist) * currentSpeed * dt;
        m.pos.y += (dy / dist) * currentSpeed * dt;
      } else if (dist > 100 && targetPos === hero.pos) {
        // Follow hero if no enemies
        m.pos.x += (dx / dist) * currentSpeed * dt;
        m.pos.y += (dy / dist) * currentSpeed * dt;
      }
    } else if (m.type === 'ranged') {
      // Ranged monsters try to stay at a distance
      if (dist > 200) {
        m.pos.x += (dx / dist) * currentSpeed * dt;
        m.pos.y += (dy / dist) * currentSpeed * dt;
      } else if (dist < 150) {
        // Back away
        m.pos.x -= (dx / dist) * currentSpeed * dt;
        m.pos.y -= (dy / dist) * currentSpeed * dt;
      }

      // Attack
      m.attackTimer = (m.attackTimer || 0) + dt;
      if (m.attackTimer >= 2 && !m.isStopAttacking) {
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
      m.pos.x += (dx / dist) * currentSpeed * dt;
      m.pos.y += (dy / dist) * currentSpeed * dt;
    }

    // Hero collision
    const heroDx = hero.pos.x - m.pos.x;
    const heroDy = hero.pos.y - m.pos.y;
    const distToHero = Math.sqrt(heroDx * heroDx + heroDy * heroDy);
    if (distToHero < hero.radius + m.radius && !m.isCharmed && !m.isFriendly && !m.isStopAttacking) {
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
      if (m.attackTimer > 3 && !m.isStopAttacking) {
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
        if (p.isCannonball) {
          // Cannonball explodes on impact — spawn shrapnel outward from impact point
          m.hp -= p.damage;
          state.damageTexts.push({
            id: getId(),
            pos: { x: m.pos.x, y: m.pos.y - 20 },
            text: Math.floor(p.damage).toString(),
            timer: 1,
            color: '#fbbf24',
          });
          const shrapnelCount = state.kingAbilities.kingBallShrapnelCount;
          const shrapnelDmg = state.kingAbilities.kingBallShrapnelDamage;
          for (let s = 0; s < shrapnelCount; s++) {
            const angle = (s / shrapnelCount) * Math.PI * 2;
            state.projectiles.push({
              id: getId(),
              pos: { x: p.pos.x, y: p.pos.y },
              vel: { x: Math.cos(angle) * 250, y: Math.sin(angle) * 250 },
              radius: 5,
              damage: shrapnelDmg,
              pierceCount: 0,
              maxPierce: 2,
              hitMonsters: new Set(),
              isShrapnel: true,
            });
          }
          state.effects.push({
            id: getId(),
            type: 'circle',
            pos: { x: p.pos.x, y: p.pos.y },
            radius: 50,
            timer: 0,
            maxTimer: 0.3,
          });
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
    if ((m.isCharmed || m.isFriendly) && !m.isStopAttacking) {
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

    if (m.isImmune) {
      m.hp = m.maxHp;
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
};
