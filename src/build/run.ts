import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { DateTime } from 'luxon';
import { loadConfig } from './loadConfig.js';
import { fetchFeed } from './fetchFeed.js';
import { parseIcs } from './parseIcs.js';
import { filterEvents } from './filterEvents.js';
import type { EventsData, KidData, NormalizedEvent } from '../types.js';

const OUTPUT_PATH = resolve(process.cwd(), 'public/data/events.json');

function loadPreviousData(): EventsData | null {
  try {
    const raw = readFileSync(OUTPUT_PATH, 'utf8');
    const parsed = JSON.parse(raw) as EventsData;
    // Treat an empty placeholder (no kids) as no prior data
    if (!Array.isArray(parsed.kids) || parsed.kids.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function run() {
  const config = loadConfig();
  const now = DateTime.now().setZone(config.resolvedTimezone);
  const previousData = loadPreviousData();

  console.log(`Building events for ${config.kids.length} kid(s) in ${config.resolvedTimezone}`);

  const settled = await Promise.allSettled(
    config.kids.map(async kid => {
      const icsText = await fetchFeed(kid.calendarUrl);
      const parsed = parseIcs(icsText, kid.name);
      const filtered = filterEvents(parsed, now, kid.seasonEndDate, config.resolvedTimezone);
      filtered.sort((a, b) => a.start.localeCompare(b.start));
      return { kid, events: filtered };
    }),
  );

  const kids: KidData[] = [];
  let allErrored = true;
  let anyPreviousAvailable = false;

  for (let i = 0; i < config.kids.length; i++) {
    const kid = config.kids[i];
    const result = settled[i];

    if (result.status === 'fulfilled') {
      allErrored = false;
      kids.push({
        name: kid.name,
        seasonEndDate: kid.seasonEndDate,
        events: result.value.events,
        fetchStatus: 'ok',
      });
      console.log(`  [${kid.name}] OK — ${result.value.events.length} upcoming event(s)`);
    } else {
      console.error(`  [${kid.name}] Error: ${result.reason}`);

      const prevKid = previousData?.kids.find(k => k.name === kid.name);
      let fallbackEvents: NormalizedEvent[] = [];

      if (prevKid && prevKid.events.length > 0) {
        anyPreviousAvailable = true;
        fallbackEvents = filterEvents(prevKid.events, now, kid.seasonEndDate, config.resolvedTimezone);
        console.log(`  [${kid.name}] Using ${fallbackEvents.length} cached event(s) from last successful run.`);
      }

      kids.push({
        name: kid.name,
        seasonEndDate: kid.seasonEndDate,
        events: fallbackEvents,
        fetchStatus: 'error',
      });
    }
  }

  if (allErrored && !anyPreviousAvailable) {
    console.error('All feeds failed and no cached data available. Exiting without writing output so deploy is skipped.');
    process.exit(1);
  }

  const output: EventsData = {
    generatedAt: DateTime.now().toISO()!,
    timezone: config.resolvedTimezone,
    kids,
  };

  mkdirSync(resolve(process.cwd(), 'public/data'), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  const totalEvents = kids.reduce((sum, k) => sum + k.events.length, 0);
  console.log(`Wrote ${OUTPUT_PATH} — ${kids.length} kid(s), ${totalEvents} total event(s).`);
}

run().catch(err => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
