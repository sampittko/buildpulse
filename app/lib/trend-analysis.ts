import { WeeklyData, TrendData } from './types';

/**
 * Calculate trend data for a given metric over 12 weeks
 */
export function calculateTrend(weeklyData: WeeklyData[], metric: 'commits' | 'hours'): TrendData {
  if (weeklyData.length === 0) {
    return {
      recent: 0,
      medium: 0,
      longer: 0,
      direction: 'stable',
      changePercentage: 0
    };
  }

  // Sort by week start (most recent first)
  const sortedData = [...weeklyData].sort((a, b) =>
    new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );

  // Calculate averages for different periods
  const recentData = sortedData.slice(0, 2); // Last 2 weeks
  const mediumData = sortedData.slice(0, 4); // Last 4 weeks
  const longerData = sortedData.slice(0, 12); // Last 12 weeks

  const recent = calculateAverage(recentData, metric);
  const medium = calculateAverage(mediumData, metric);
  const longer = calculateAverage(longerData, metric);

  // Calculate trend direction based on comparing recent vs longer term
  const { direction, changePercentage } = calculateTrendDirection(recent, longer);

  return {
    recent,
    medium,
    longer,
    direction,
    changePercentage
  };
}

/**
 * Calculate average for a metric over given weeks
 */
function calculateAverage(data: WeeklyData[], metric: 'commits' | 'hours'): number {
  if (data.length === 0) return 0;

  const sum = data.reduce((total, week) => {
    return total + (metric === 'commits' ? week.commits : week.hours);
  }, 0);

  return sum / data.length;
}

/**
 * Calculate trend direction and percentage change
 */
function calculateTrendDirection(recent: number, longer: number): {
  direction: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
} {
  if (longer === 0) {
    if (recent > 0) {
      return { direction: 'increasing', changePercentage: 100 };
    }
    return { direction: 'stable', changePercentage: 0 };
  }

  const changePercentage = ((recent - longer) / longer) * 100;

  let direction: 'increasing' | 'decreasing' | 'stable';
  if (Math.abs(changePercentage) < 10) {
    direction = 'stable';
  } else if (changePercentage > 0) {
    direction = 'increasing';
  } else {
    direction = 'decreasing';
  }

  return { direction, changePercentage };
}

/**
 * Calculate enhanced pulse score based on trends and target hours
 */
export function calculateTrendBasedPulseScore(
  commitTrend: TrendData,
  hoursTrend: TrendData,
  targetWeeklyHours: number,
  config: {
    commitWeight: number;
    hoursWeight: number;
    recentWeight: number;
    mediumWeight: number;
    longerWeight: number;
    trendWeight: number;
    targetCompletionBonus: number;
    targetCompletionPenalty: number;
  }
): { pulseScore: number; trendScore: number } {
  // Base score using weighted averages of different time periods
  const commitScore =
    (commitTrend.recent * config.recentWeight) +
    (commitTrend.medium * config.mediumWeight) +
    (commitTrend.longer * config.longerWeight);

  const hoursScore =
    (hoursTrend.recent * config.recentWeight) +
    (hoursTrend.medium * config.mediumWeight) +
    (hoursTrend.longer * config.longerWeight);

  const baseScore = (commitScore * config.commitWeight) + (hoursScore * config.hoursWeight);

  // Trend bonus/penalty
  const commitTrendMultiplier = getTrendMultiplier(commitTrend.direction, commitTrend.changePercentage);
  const hoursTrendMultiplier = getTrendMultiplier(hoursTrend.direction, hoursTrend.changePercentage);

  const trendScore = baseScore * ((commitTrendMultiplier + hoursTrendMultiplier) / 2) * config.trendWeight;

  // Target completion adjustment
  const targetCompletion = targetWeeklyHours > 0 ? (hoursTrend.recent / targetWeeklyHours) : 1;
  const targetAdjustment = calculateTargetAdjustment(
    targetCompletion,
    config.targetCompletionBonus,
    config.targetCompletionPenalty
  );

  const finalScore = (baseScore + trendScore) * targetAdjustment;

  return {
    pulseScore: Math.max(0, finalScore), // Ensure non-negative
    trendScore
  };
}

/**
 * Calculate target completion adjustment multiplier
 */
function calculateTargetAdjustment(
  targetCompletion: number,
  bonusMultiplier: number,
  penaltyMultiplier: number
): number {
  if (targetCompletion >= 1.0) {
    // Meeting or exceeding target - apply bonus
    const bonus = Math.min((targetCompletion - 1.0) * bonusMultiplier, 0.5); // Max 50% bonus
    return 1.0 + bonus;
  } else if (targetCompletion >= 0.7) {
    // Close to target (70-99%) - neutral
    return 1.0;
  } else {
    // Missing target significantly - apply penalty
    const shortfall = 1.0 - targetCompletion;
    const penalty = Math.min(shortfall * penaltyMultiplier, 0.4); // Max 40% penalty
    return Math.max(0.6, 1.0 - penalty); // Minimum 60% of base score
  }
}

/**
 * Get multiplier based on trend direction
 */
function getTrendMultiplier(direction: 'increasing' | 'decreasing' | 'stable', changePercentage: number): number {
  switch (direction) {
    case 'increasing':
      // Bonus for increasing trends, max 50% bonus
      return 1 + Math.min(changePercentage / 100, 0.5);
    case 'decreasing':
      // Penalty for decreasing trends, max 30% penalty
      return 1 - Math.min(Math.abs(changePercentage) / 100, 0.3);
    case 'stable':
      return 1;
    default:
      return 1;
  }
}

/**
 * Determine trend status based on both commit and hours trends
 */
export function getTrendStatus(
  commitTrend: TrendData,
  hoursTrend: TrendData
): 'improving' | 'stable' | 'declining' {
  const directions = [commitTrend.direction, hoursTrend.direction];

  const increasingCount = directions.filter(d => d === 'increasing').length;
  const decreasingCount = directions.filter(d => d === 'decreasing').length;

  if (increasingCount > decreasingCount) {
    return 'improving';
  } else if (decreasingCount > increasingCount) {
    return 'declining';
  } else {
    return 'stable';
  }
}

/**
 * Generate weekly data points for the last 12 weeks
 */
export function generateWeekStarts(weeksCount: number = 12): string[] {
  const weeks: string[] = [];
  const now = new Date();

  for (let i = 0; i < weeksCount; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));

    // Find the Saturday of this week (week starts on Saturday)
    const dayOfWeek = weekStart.getDay();
    const daysToSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
    weekStart.setDate(weekStart.getDate() - daysToSaturday);

    weeks.push(weekStart.toISOString().split('T')[0]);
  }

  return weeks.reverse(); // Oldest first
} 