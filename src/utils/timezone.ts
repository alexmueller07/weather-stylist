// Function to get timezone from coordinates using a simple estimation
export const getTimezoneFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    // Calculate timezone offset based on longitude (more accurate than Etc/GMT)
    const timezoneOffset = Math.round(lng / 15);
    
    // Map to common timezone names
    const timezoneMap: { [key: number]: string } = {
      [-12]: 'Pacific/Auckland', // Approximate
      [-11]: 'Pacific/Auckland',
      [-10]: 'Pacific/Honolulu',
      [-9]: 'America/Anchorage',
      [-8]: 'America/Los_Angeles',
      [-7]: 'America/Denver',
      [-6]: 'America/Chicago',
      [-5]: 'America/New_York',
      [-4]: 'America/Toronto',
      [-3]: 'America/Sao_Paulo',
      [-2]: 'Atlantic/South_Georgia',
      [-1]: 'Atlantic/Azores',
      0: 'Europe/London',
      1: 'Europe/Paris',
      2: 'Europe/Kiev',
      3: 'Europe/Moscow',
      4: 'Asia/Dubai',
      5: 'Asia/Tashkent',
      6: 'Asia/Almaty',
      7: 'Asia/Bangkok',
      8: 'Asia/Shanghai',
      9: 'Asia/Tokyo',
      10: 'Australia/Sydney',
      11: 'Pacific/Guadalcanal',
      12: 'Pacific/Auckland'
    };
    
    return timezoneMap[timezoneOffset] || `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;
  } catch (error) {
    console.error('Error calculating timezone:', error);
    // Fallback to a simple timezone estimation based on longitude
    const timezoneOffset = Math.round(lng / 15);
    return `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;
  }
};

// Function to get current time in a specific timezone
export const getCurrentTimeInTimezone = (timezone: string): Date => {
  try {
    const now = new Date();
    const timeInTimezone = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);
    
    return new Date(timeInTimezone);
  } catch (error) {
    console.error('Error getting time in timezone:', error);
    return new Date(); // Fallback to current time
  }
};

// Function to format time for display
export const formatTimeInTimezone = (timezone: string): string => {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);
  } catch (error) {
    console.error('Error formatting time:', error);
    return new Date().toLocaleTimeString();
  }
}; 