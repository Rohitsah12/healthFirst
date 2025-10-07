// src/utils/time.ts
const pad = (n: number) => String(n).padStart(2, '0');

export const DEFAULT_TIMEZONE = 'Asia/Kolkata'; // change to 'Asia/Kathmandu' if you prefer NPT
export const DEFAULT_TZ_OFFSET_MINUTES = 330; // IST = +5:30 = 330 minutes; For NPT use 345

/**
 * Format an ISO timestamp (e.g. "1970-01-01T03:30:00.000Z") into a human-friendly 12-hour string
 * in the given timezone (default Asia/Kolkata).
 */
export const formatISOToLocalTime = (iso: string | undefined | null, tz = DEFAULT_TIMEZONE) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    });
  } catch {
    return '-';
  }
};

/**
 * Convert ISO timestamp (or partial time string) to "HH:mm" in given timezone (24-hour) suitable for <input type="time" />.
 * If `iso` looks like an ISO date (contains 'T'), we parse it as Date; otherwise if it's already "HH:mm:ss" or "HH:mm" we normalize.
 */
export const isoOrTimeStringToHHMM = (isoOrTime: string, tz = DEFAULT_TIMEZONE) => {
  if (!isoOrTime) return '00:00';
  // if looks like ISO
  if (isoOrTime.includes('T') || isoOrTime.endsWith('Z')) {
    try {
      const parts = new Date(isoOrTime).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: tz,
      });
      return parts; // "09:00"
    } catch {
      return '00:00';
    }
  }

  // otherwise assume something like "HH:mm:ss" or "HH:mm"
  const [h, m] = isoOrTime.split(':');
  if (h === undefined || m === undefined) return '00:00';
  return `${pad(Number(h))}:${pad(Number(m))}`;
};

/**
 * Convert a local "HH:mm" string in the given timezone to a UTC ISO "1970-01-01T..Z".
 * Many backends store times as 1970-01-01Txx:xx:00.000Z.
 *
 * tzOffsetMinutes: minutes offset from UTC (e.g., IST = +330). Default uses DEFAULT_TZ_OFFSET_MINUTES.
 */
export const localHHMMToUTCISO = (hhmm: string, tzOffsetMinutes = DEFAULT_TZ_OFFSET_MINUTES) => {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr || '0');
  const m = Number(mStr || '0');

  const localMinutes = h * 60 + m;
  let utcMinutes = localMinutes - tzOffsetMinutes; // convert local to UTC minutes
  utcMinutes = ((utcMinutes % 1440) + 1440) % 1440; // normalize 0..1439

  const utcH = Math.floor(utcMinutes / 60);
  const utcM = utcMinutes % 60;

  return `1970-01-01T${pad(utcH)}:${pad(utcM)}:00.000Z`;
};
