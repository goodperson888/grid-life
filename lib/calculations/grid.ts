/**
 * 格子图核心算法
 * 将人生转化为以周为单位的格子，每格代表一周
 */

export type CellStatus = "past" | "current" | "future";

export interface GridCell {
  index: number;       // 第几周（从 0 开始）
  status: CellStatus;
  age: number;         // 该格子对应的年龄
  year: number;        // 该格子对应的出生后第几年
}

export interface GridStats {
  totalWeeks: number;
  weeksLived: number;
  weeksRemaining: number;
  percentageLived: number;
  currentAge: number;
}

/**
 * 计算所有格子的状态
 * @param birthDate 出生日期
 * @param expectedLifespan 预期寿命（年），默认 90
 */
export function calculateGridCells(
  birthDate: Date,
  expectedLifespan: number = 90
): GridCell[] {
  const totalWeeks = expectedLifespan * 52;
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksLived = Math.floor((now.getTime() - birthDate.getTime()) / msPerWeek);

  return Array.from({ length: totalWeeks }, (_, i) => ({
    index: i,
    status: i < weeksLived ? "past" : i === weeksLived ? "current" : "future",
    age: Math.floor(i / 52),
    year: Math.floor(i / 52) + 1,
  }));
}

/**
 * 计算人生统计数据
 */
export function calculateGridStats(
  birthDate: Date,
  expectedLifespan: number = 90
): GridStats {
  const totalWeeks = expectedLifespan * 52;
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const weeksLived = Math.min(
    Math.floor((now.getTime() - birthDate.getTime()) / msPerWeek),
    totalWeeks
  );
  const ageMs = now.getTime() - birthDate.getTime();
  const currentAge = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));

  return {
    totalWeeks,
    weeksLived,
    weeksRemaining: totalWeeks - weeksLived,
    percentageLived: Math.round((weeksLived / totalWeeks) * 100),
    currentAge,
  };
}
