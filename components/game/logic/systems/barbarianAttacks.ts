
import { GameState } from '../../types';
import { getId } from '../../utils/id';

/**
 * Updates the state of the Barbarian's attacks based on user input and game state.
 * @param state The current game state.
 * @param dt The time delta since the last update.
 * @param damageMultiplier The multiplier for damage calculation.
 * @param critMultiplier The multiplier for critical hit damage.
 */
export const updateBarbarianAttacks = (state: GameState, dt: number, damageMultiplier: number, critMultiplier: number) => {
  const { hero, barbarianAbilities, keys, mousePos, mouseDown } = state;

  // Update cooldowns for all barbarian abilities.
  if (barbarianAbilities.sweepingStrikeTimer > 0) barbarianAbilities.sweepingStrikeTimer -= dt;
  if (barbarianAbilities.sweepingRoundTimer > 0) barbarianAbilities.sweepingRoundTimer -= dt;
  if (barbarianAbilities.ruptureTimer > 0) barbarianAbilities.ruptureTimer -= dt;
  if (barbarianAbilities.rageDashTimer > 0) barbarianAbilities.rageDashTimer -= dt;

  // Handle the Sweeping Strike attack (Left Mouse Button).
  if (mouseDown.left && barbarianAbilities.sweepingStrikeTimer <= 0) {
    // Reset cooldown timer.
    barbarianAbilities.sweepingStrikeTimer = barbarianAbilities.sweepingStrikeCooldown;
    // Calculate the angle of the attack towards the mouse cursor.
    const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
    const range = 80;
    const arc = Math.PI / 2; // 90 degrees

    // Create a visual effect for the slash attack.
    state.effects.push({
      id: getId(),
      type: 'slash',
      pos: { ...hero.pos },
      angle: angleToMouse,
      radius: range,
      timer: 0,
      maxTimer: 0.2,
    });

    // Check for monster hits within the attack range and arc.
    for (const m of state.monsters) {
      const dx = m.pos.x - hero.pos.x;
      const dy = m.pos.y - hero.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= range + m.radius) {
        const angleToMonster = Math.atan2(dy, dx);
        let angleDiff = angleToMonster - angleToMouse;
        // Normalize angle difference to be within -PI and PI.
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // If the monster is within the attack arc, apply damage.
        if (Math.abs(angleDiff) <= arc / 2) {
          m.hp -= barbarianAbilities.sweepingStrikeDamage * damageMultiplier * critMultiplier;
        }
      }
    }
  }

  // Handle the Sweeping Round attack (Right Mouse Button).
  if (mouseDown.right && barbarianAbilities.sweepingRoundTimer <= 0 && hero.mana >= 10) {
    // Consume mana and reset cooldown timer.
    hero.mana -= 10;
    barbarianAbilities.sweepingRoundTimer = barbarianAbilities.sweepingRoundCooldown;
    const range = 120;

    // Create a visual effect for the circular attack.
    state.effects.push({
      id: getId(),
      type: 'circle',
      pos: { ...hero.pos },
      radius: range,
      timer: 0,
      maxTimer: 0.3,
    });

    // Check for monster hits within the attack range and apply damage.
    for (const m of state.monsters) {
      const dx = m.pos.x - hero.pos.x;
      const dy = m.pos.y - hero.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= range + m.radius) {
        m.hp -= barbarianAbilities.sweepingRoundDamage * damageMultiplier * critMultiplier;
      }
    }
  }

  // Handle the Rupture ability (Q key).
  if (keys['q'] && barbarianAbilities.ruptureTimer <= 0 && hero.mana >= 20) {
    // Consume mana and reset cooldown timer.
    hero.mana -= 20;
    barbarianAbilities.ruptureTimer = barbarianAbilities.ruptureCooldown;
    // Calculate the direction and end position of the rupture.
    const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
    const length = 500;
    const endPos = {
      x: hero.pos.x + Math.cos(angleToMouse) * length,
      y: hero.pos.y + Math.sin(angleToMouse) * length,
    };

    // Create a rupture path that deals damage over time.
    state.rupturePaths.push({
      id: getId(),
      start: { ...hero.pos },
      end: endPos,
      timer: 6, // Duration of the rupture path.
      damage: barbarianAbilities.ruptureDamage * damageMultiplier,
    });

    // Create a visual effect for the rupture.
    state.effects.push({
      id: getId(),
      type: 'rupture',
      pos: { ...hero.pos },
      angle: angleToMouse,
      radius: length,
      timer: 0,
      maxTimer: 0.4,
    });

    // Apply initial burst damage to monsters along the rupture path.
    for (const m of state.monsters) {
      // Calculate the distance from the monster to the rupture line segment.
      const l2 = length * length;
      let t = ((m.pos.x - hero.pos.x) * (endPos.x - hero.pos.x) + (m.pos.y - hero.pos.y) * (endPos.y - hero.pos.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = hero.pos.x + t * (endPos.x - hero.pos.x);
      const projY = hero.pos.y + t * (endPos.y - hero.pos.y);
      const dist = Math.sqrt((m.pos.x - projX) ** 2 + (m.pos.y - projY) ** 2);

      // If the monster is close enough to the line, apply damage.
      if (dist <= m.radius + 30) {
        m.hp -= barbarianAbilities.ruptureDamage * damageMultiplier * critMultiplier;
      }
    }
  }

  // Handle the Rage Dash ability (E key).
  if (keys['e'] && barbarianAbilities.rageDashTimer <= 0 && !barbarianAbilities.isDashing && hero.mana >= 15) {
    // Consume mana, reset cooldown, and set dashing state.
    hero.mana -= 15;
    barbarianAbilities.rageDashTimer = barbarianAbilities.rageDashCooldown;
    barbarianAbilities.isDashing = true;
    barbarianAbilities.dashTimer = 0;

    // Calculate dash target position based on mouse direction.
    const angleToMouse = Math.atan2(mousePos.y - hero.pos.y, mousePos.x - hero.pos.x);
    const dashDist = 600;
    barbarianAbilities.dashTarget = {
      x: hero.pos.x + Math.cos(angleToMouse) * dashDist,
      y: hero.pos.y + Math.sin(angleToMouse) * dashDist,
    };

    // Create a visual effect for the dash.
    state.effects.push({
      id: getId(),
      type: 'dash',
      pos: { ...hero.pos },
      angle: angleToMouse,
      timer: 0,
      maxTimer: barbarianAbilities.dashDuration,
    });
  }
};
