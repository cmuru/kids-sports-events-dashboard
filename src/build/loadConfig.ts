import { readFileSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';

export interface KidConfig {
  name: string;
  calendarUrl: string;
  seasonEndDate: string;
}

export interface Config {
  kids: KidConfig[];
  resolvedTimezone: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function loadConfig(configPath = resolve(process.cwd(), 'config.yaml')): Config {
  let raw: string;
  try {
    raw = readFileSync(configPath, 'utf8');
  } catch {
    throw new Error(`config.yaml not found at ${configPath}. Create it with your kids' calendar info.`);
  }

  const parsed = yaml.load(raw) as Record<string, unknown>;

  if (!Array.isArray(parsed?.kids) || (parsed.kids as unknown[]).length === 0) {
    throw new Error('config.yaml must have a non-empty "kids" list.');
  }

  const kids: KidConfig[] = (parsed.kids as unknown[]).map((entry, i) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`kids[${i}]: each entry must be an object with name, calendarUrl, and seasonEndDate.`);
    }
    const k = entry as Record<string, unknown>;
    const label = typeof k.name === 'string' && k.name ? k.name : `kids[${i}]`;

    if (!k.name || typeof k.name !== 'string') {
      throw new Error(`${label}: missing required field "name".`);
    }
    if (!k.calendarUrl || typeof k.calendarUrl !== 'string') {
      throw new Error(`${label}: missing required field "calendarUrl".`);
    }
    if (!k.seasonEndDate) {
      throw new Error(`${label}: missing required field "seasonEndDate".`);
    }

    const seasonEndDate = String(k.seasonEndDate);
    if (!DATE_RE.test(seasonEndDate)) {
      throw new Error(`${label}: seasonEndDate "${seasonEndDate}" must be in YYYY-MM-DD format.`);
    }

    let calendarUrl = k.calendarUrl;
    const urlToValidate = calendarUrl.replace(/^webcal:\/\//i, 'https://');
    try {
      new URL(urlToValidate);
    } catch {
      throw new Error(`${label}: calendarUrl "${calendarUrl}" is not a valid URL.`);
    }

    // Normalize webcal:// → https://
    calendarUrl = calendarUrl.replace(/^webcal:\/\//i, 'https://');

    return { name: k.name, calendarUrl, seasonEndDate };
  });

  const resolvedTimezone = resolveTimezone(parsed.timezone);

  return { kids, resolvedTimezone };
}

function resolveTimezone(raw: unknown): string {
  if (raw === undefined || raw === null) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(`No timezone in config.yaml — using host timezone: ${tz}`);
    return tz;
  }

  if (typeof raw !== 'string') {
    throw new Error(`timezone must be a string (e.g. "America/Toronto"), got ${typeof raw}.`);
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: raw });
  } catch {
    throw new Error(`timezone "${raw}" is not a recognized IANA timezone (e.g. "America/Toronto").`);
  }

  return raw;
}
