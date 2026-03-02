/**
 * 剩余次数核心算法
 * 核心洞察：你想做的事情，用一次少一次
 */

export interface RemainingResult {
  totalRemaining: number;       // 总剩余次数
  highQualityRemaining: number; // 高质量剩余次数（质量衰减后）
  yearsLeft: number;            // 剩余年数
}

/**
 * 计算某件事的剩余次数
 * @param currentAge 当前年龄
 * @param activeUntilAge 预计能做到的年龄
 * @param frequencyPerYear 每年频率
 * @param qualityDecayAge 质量衰减起始年龄（可选）
 */
export function calculateRemainingTimes(
  currentAge: number,
  activeUntilAge: number,
  frequencyPerYear: number,
  qualityDecayAge?: number
): RemainingResult {
  const yearsLeft = Math.max(0, activeUntilAge - currentAge);
  const totalRemaining = Math.floor(yearsLeft * frequencyPerYear);

  // 计算高质量次数：质量衰减年龄之前的次数
  let highQualityRemaining = totalRemaining;
  if (qualityDecayAge && qualityDecayAge > currentAge) {
    const highQualityYears = Math.min(yearsLeft, qualityDecayAge - currentAge);
    highQualityRemaining = Math.floor(highQualityYears * frequencyPerYear);
  }

  return { totalRemaining, highQualityRemaining, yearsLeft };
}

/**
 * 预设场景：和父母团聚
 * 假设：毕业后每年见 2 次，每次 5 天
 */
export function calcParentTime(currentAge: number, parentAge: number): {
  remainingDays: number;
  remainingMeetings: number;
} {
  // 父母预期活到 85 岁
  const parentYearsLeft = Math.max(0, 85 - parentAge);
  const meetingsPerYear = 2;
  const daysPerMeeting = 5;

  const remainingMeetings = Math.floor(parentYearsLeft * meetingsPerYear);
  const remainingDays = remainingMeetings * daysPerMeeting;

  return { remainingDays, remainingMeetings };
}
