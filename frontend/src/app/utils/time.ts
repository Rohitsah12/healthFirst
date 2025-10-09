// src/utils/time.ts

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_TZ_OFFSET_MINUTES = 330; // IST is UTC+5:30

/**
 * Converts a full UTC ISO string (e.g., "2025-10-09T18:30:00Z") or a simple time string ("18:30")
 * into a local HH:mm time string based on the provided timezone.
 */
export const isoOrTimeStringToHHMM = (
  isoOrTime: string | null | undefined,
  timezone: string = DEFAULT_TIMEZONE
): string => {
  if (!isoOrTime) return '00:00';

  // If it's already in HH:mm format, return it directly.
  if (/^\d{2}:\d{2}$/.test(isoOrTime)) {
    return isoOrTime;
  }

  // If it's a full ISO string with a 'T', convert it.
  if (isoOrTime.includes('T')) {
    try {
      const date = new Date(isoOrTime);
      const localTime = date.toLocaleTimeString('en-GB', { // 'en-GB' is a reliable way to get 24-hour format
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
      });
      // Handle edge case where midnight is "24:00"
      return localTime === '24:00' ? '00:00' : localTime;
    } catch (error) {
      console.error('Error parsing ISO time:', error);
      return '00:00';
    }
  }
  // Fallback for any other format
  return isoOrTime;
};


/**
 * Converts a local HH:mm time string into a full UTC ISO string for the current day.
 * This function is reliable and does not depend on the server's local time.
 * @param localTime - The time in "HH:mm" format (e.g., "09:30").
 */
export const localHHMMToUTCISO = (localTime: string): string => {
  if (!localTime || !/^\d{2}:\d{2}$/.test(localTime)) {
    throw new Error('Invalid time format. Expected HH:mm');
  }

  const [hours, minutes] = localTime.split(':').map(Number);
  
  // Get the current date in UTC
  const now = new Date();
  
  // Set the time in UTC based on the local input and offset
  // (hours * 60) + minutes = total minutes from midnight in local time
  // Subtract the offset to get the total minutes from midnight in UTC
  const totalLocalMinutes = (hours * 60) + minutes;
  const totalUtcMinutes = totalLocalMinutes - DEFAULT_TZ_OFFSET_MINUTES;

  // Set the UTC date and time
  now.setUTCHours(0, 0, 0, 0); // Reset to midnight UTC
  now.setUTCMinutes(totalUtcMinutes);
  
  return now.toISOString();
};


/**
 * Converts a local HH:mm time string (IST) to a UTC HH:mm time string.
 */
export const localHHMMToUTCHHMM = (localTime: string): string => {
  if (!localTime || !/^\d{2}:\d{2}$/.test(localTime)) {
    return '00:00';
  }

  const [hours, minutes] = localTime.split(':').map(Number);
  const localMinutes = hours * 60 + minutes;
  
  // Subtract IST offset to get UTC time. The modulo handles negative results correctly.
  const utcMinutes = ((localMinutes - DEFAULT_TZ_OFFSET_MINUTES) % 1440 + 1440) % 1440;
  
  const utcHours = Math.floor(utcMinutes / 60);
  const utcMins = utcMinutes % 60;
  
  return `${String(utcHours).padStart(2, '0')}:${String(utcMins).padStart(2, '0')}`;
};

/**
 * Converts a UTC HH:mm time string to a local HH:mm time string (IST).
 */
export const utcHHMMToLocalHHMM = (utcTime: string): string => {
  if (!utcTime || !/^\d{2}:\d{2}$/.test(utcTime)) {
    return '00:00';
  }

  const [hours, minutes] = utcTime.split(':').map(Number);
  const utcMinutes = hours * 60 + minutes;
  
  // Add IST offset to get local time
  const localMinutes = (utcMinutes + DEFAULT_TZ_OFFSET_MINUTES) % 1440;
  
  const localHours = Math.floor(localMinutes / 60);
  const localMins = localMinutes % 60;
  
  return `${String(localHours).padStart(2, '0')}:${String(localMins).padStart(2, '0')}`;
};


/**
 * Formats a full UTC ISO string into a human-readable 12-hour local time (e.g., "9:30 PM").
 */
export const formatISOToLocalTime = (
  isoString: string | null | undefined,
  timezone: string = DEFAULT_TIMEZONE
): string => {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', { // 'en-IN' is a good locale for India
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};