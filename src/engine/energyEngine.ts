import { ENERGY_REGEN_MS, ENERGY_CAP } from '@/lib/constants';

export function calculateEnergyRegen(
  lastRegenTimestamp: number,
  now: number,
  currentEnergy: number,
  cap: number = ENERGY_CAP
): { newEnergy: number; newTimestamp: number } {
  const elapsed = now - lastRegenTimestamp;
  const ticks = Math.floor(elapsed / ENERGY_REGEN_MS);

  if (ticks <= 0 || currentEnergy >= cap) {
    return { newEnergy: currentEnergy, newTimestamp: lastRegenTimestamp };
  }

  const newEnergy = Math.min(currentEnergy + ticks, cap);
  const newTimestamp = lastRegenTimestamp + ticks * ENERGY_REGEN_MS;

  return { newEnergy, newTimestamp };
}

export function getTimeUntilNextRegen(lastRegenTimestamp: number, now: number): number {
  const elapsed = now - lastRegenTimestamp;
  const remaining = ENERGY_REGEN_MS - (elapsed % ENERGY_REGEN_MS);
  return remaining;
}
