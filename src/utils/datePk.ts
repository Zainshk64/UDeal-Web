export const formatTimePK = (dateString: string | null): string => {
  if (!dateString) return '';

  try {
    let isoString = dateString;

    if (!isoString.endsWith('Z') && !isoString.includes('+')) {
      isoString = isoString + 'Z';
    }

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const pkOffset = 5 * 60;
    const pkTime = new Date(date.getTime() + pkOffset * 60 * 1000);

    const hours = pkTime.getUTCHours();
    const minutes = pkTime.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const minuteStr = minutes.toString().padStart(2, '0');

    return `${hour12}:${minuteStr} ${ampm}`;
  } catch (error) {
    console.log('⚠️ Time format error:', error);
    return '';
  }
};

export const formatDateTimePK = (dateString: string | null): string => {
  if (!dateString) return '';

  try {
    let isoString = dateString;

    if (!isoString.endsWith('Z') && !isoString.includes('+')) {
      isoString = isoString + 'Z';
    }

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const pkOffset = 5 * 60 * 60 * 1000;
    const now = new Date();
    const nowPK = new Date(now.getTime() + pkOffset);
    const datePK = new Date(date.getTime() + pkOffset);

    const nowDay = Math.floor(nowPK.getTime() / (24 * 60 * 60 * 1000));
    const msgDay = Math.floor(datePK.getTime() / (24 * 60 * 60 * 1000));
    const diffDays = nowDay - msgDay;

    if (diffDays === 0) {
      return formatTimePK(dateString);
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w ago`;
    } else {
      return `${Math.floor(diffDays / 30)}mo ago`;
    }
  } catch {
    return '';
  }
};
