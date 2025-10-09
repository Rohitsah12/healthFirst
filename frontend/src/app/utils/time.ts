export const DEFAULT_TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_TZ_OFFSET_MINUTES = 330; // IST is UTC+5:30

/**
 * Converts any time format to IST 12-hour format
 * Handles UTC to IST conversion for ISO strings and 24-hour formats
 */
export const formatTimeToLocal = (
  timeString: string,
  timezone: string = DEFAULT_TIMEZONE
): string => {
  if (!timeString) return '';

  // If already in 12-hour format (e.g., "04:00 PM"), check if it needs UTC->IST conversion
  if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(timeString)) {
    // This might be UTC time formatted as 12-hour, so we need to convert it
    // Parse it back to 24-hour and then convert
    const match = timeString.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const period = match[3].toUpperCase();

      // Convert to 24-hour
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      // Create a UTC date with today's date and the time
      const now = new Date();
      const utcDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        parseInt(minutes)
      ));

      // Convert to IST
      return utcDate.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return timeString;
  }

  // If it's an ISO datetime string (contains 'T')
  if (timeString.includes('T')) {
    return formatISOToLocalTime(timeString, timezone);
  }

  // If it's 24-hour format (e.g., "16:00" in UTC), convert to IST
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    const [hours, minutes] = timeString.split(':').map(Number);

    // Create a UTC date with today's date and the time
    const now = new Date();
    const utcDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      minutes
    ));

    // Convert to IST with 12-hour format
    return utcDate.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return timeString;
};

export const isoOrTimeStringToHHMM = (
  isoOrTime: string,
  timezone: string = DEFAULT_TIMEZONE
): string => {
  if (!isoOrTime) return '00:00';

  if (/^\d{2}:\d{2}$/.test(isoOrTime)) {
    return isoOrTime;
  }

  if (isoOrTime.includes('T')) {
    try {
      const date = new Date(isoOrTime);
      const localTime = date.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      return localTime;
    } catch (error) {
      console.error('Error parsing ISO time:', error);
      return '00:00';
    }
  }

  return isoOrTime;
};

export const localHHMMToUTCISO = (
  localTime: string,
  timezone: string = DEFAULT_TIMEZONE
): string => {
  if (!localTime || !/^\d{2}:\d{2}$/.test(localTime)) {
    throw new Error('Invalid time format. Expected HH:mm');
  }

  const [hours, minutes] = localTime.split(':').map(Number);

  const now = new Date();
  const localDate = new Date(
    now.toLocaleString('en-US', { timeZone: timezone })
  );

  localDate.setHours(hours, minutes, 0, 0);

  const utcDate = new Date(localDate.getTime() - (DEFAULT_TZ_OFFSET_MINUTES * 60 * 1000));

  return utcDate.toISOString();
};

export const localHHMMToUTCHHMM = (localTime: string): string => {
  if (!localTime || !/^\d{2}:\d{2}$/.test(localTime)) {
    return '00:00';
  }

  const [hours, minutes] = localTime.split(':').map(Number);
  const localMinutes = hours * 60 + minutes;

  // Subtract IST offset (330 minutes) to get UTC time
  const utcMinutes = ((localMinutes - DEFAULT_TZ_OFFSET_MINUTES) % 1440 + 1440) % 1440;

  const utcHours = Math.floor(utcMinutes / 60);
  const utcMins = utcMinutes % 60;

  return `${String(utcHours).padStart(2, '0')}:${String(utcMins).padStart(2, '0')}`;
};

export const utcHHMMToLocalHHMM = (utcTime: string): string => {
  if (!utcTime || !/^\d{2}:\d{2}$/.test(utcTime)) {
    return '00:00';
  }

  const [hours, minutes] = utcTime.split(':').map(Number);
  const utcMinutes = hours * 60 + minutes;

  // Add IST offset (330 minutes) to get local time
  const localMinutes = (utcMinutes + DEFAULT_TZ_OFFSET_MINUTES) % 1440;

  const localHours = Math.floor(localMinutes / 60);
  const localMins = localMinutes % 60;

  return `${String(localHours).padStart(2, '0')}:${String(localMins).padStart(2, '0')}`;
};

export const formatISOToLocalTime = (
  isoString: string,
  timezone: string = DEFAULT_TIMEZONE
): string => {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};