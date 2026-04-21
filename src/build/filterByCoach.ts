import type { NormalizedEvent } from '../types.js';

export function filterByCoach(
  events: NormalizedEvent[],
  coachName: string | undefined,
): NormalizedEvent[] {
  if (coachName === undefined) return events;
  const needle = coachName.toLowerCase();
  return events.filter(e => e.title.toLowerCase().includes(needle));
}
