import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { DateTime } from 'luxon';
import { loadConfig } from './loadConfig.js';
import { fetchFeed } from './fetchFeed.js';
import { parseIcs } from './parseIcs.js';
import { filterByCoach } from './filterByCoach.js';
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

  // Fetch and parse the shared feed once
  let sharedEvents: NormalizedEvent[] | null = null;
  let feedError: unknown = null;
  try {
    const icsText = await fetchFeed(config.webcalUrl);
    sharedEvents = parseIcs(icsText);
  } catch (err) {
    feedError = err;
    console.error(`Feed fetch/parse failed: ${feedError}`);
  }

  const kids: KidData[] = [];
  let allErrored = true;
  let anyPreviousAvailable = false;

  for (const kid of config.kids) {
    if (sharedEvents !== null) {
      allErrored = false;
      const coachFiltered = filterByCoach(sharedEvents, kid.coachName);
      const withKidName = coachFiltered.map(e => ({ ...e, kidName: kid.name }));
      const dateFiltered = filterEvents(withKidName, now, kid.seasonEndDate, config.resolvedTimezone);
      dateFiltered.sort((a, b) => a.start.localeCompare(b.start));
      kids.push({
        name: kid.name,
        seasonEndDate: kid.seasonEndDate,
        events: dateFiltered,
        fetchStatus: 'ok',
      });
      console.log(`  [${kid.name}] OK — ${dateFiltered.length} upcoming event(s)`);
    } else {
      console.error(`  [${kid.name}] Error: shared feed unavailable`);

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

  // Log unmatched events (events that didn't match any child's coachName)
  if (sharedEvents !== null) {
    const unmatchedCount = sharedEvents.filter(
      event => !config.kids.some(kid => filterByCoach([event], kid.coachName).length > 0),
    ).length;
    if (unmatchedCount > 0) {
      console.log(`  [info] ${unmatchedCount} event(s) from the shared feed matched no child's coachName.`);
    }
  }

  if (allErrored && !anyPreviousAvailable) {
    console.error('Feed failed and no cached data available. Exiting without writing output so deploy is skipped.');
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
