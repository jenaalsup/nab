export function formatTimeLeft(endTimestamp: number): string {
  const now = Date.now();
  const timeLeft = endTimestamp - now;

  if (timeLeft <= 0) {
    return 'Listing ended';
  }

  const minutes = Math.floor(timeLeft / (1000 * 60));
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} left`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`;
  }
  return 'Less than a minute left';
}