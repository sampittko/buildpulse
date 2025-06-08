/**
 * Calculate the start of the current week (Saturday-based)
 */
export function getWeekStart(): Date {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate days since last Saturday (week start)
  const daysSinceSaturday = currentDay === 6 ? 0 : (currentDay + 1) % 7;

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysSinceSaturday);
  weekStart.setHours(0, 0, 0, 0); // Start of day

  return weekStart;
}

/**
 * Check if a date is in the current week (Saturday-based)
 */
export function isInCurrentWeek(date: Date): boolean {
  const weekStart = getWeekStart();
  return date >= weekStart;
}

/**
 * Get a human-readable description of the current week
 */
export function getCurrentWeekDescription(): string {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return `${formatDate(weekStart)} to ${formatDate(weekEnd)} (Saturday-Friday)`;
}

/**
 * Calculate days since last Saturday
 */
export function getDaysSinceSaturday(): number {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  return currentDay === 6 ? 0 : (currentDay + 1) % 7;
} 