// カレンダーグリッド生成ユーティリティ（日曜始まり）
export function getMonthGrid(year: number, month: number) {
  // month: 0-11
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: { date: Date | null }[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ date: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d) });
  while (cells.length % 7 !== 0) cells.push({ date: null });

  return cells;
}

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatMonthLabel(year: number, month: number) {
  return `${year}年${month + 1}月`;
}

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

// 午前(9:00〜12:00) / 午後(13:00〜16:00) を30分刻みで区切った時刻候補を生成
export function buildTimeOptions(slot: "am" | "pm"): string[] {
  const start = slot === "am" ? 9 * 60 : 13 * 60;
  const end = slot === "am" ? 12 * 60 : 16 * 60;
  const times: string[] = [];
  for (let m = start; m < end; m += 30) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    times.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }
  return times;
}

// 空き枠設定(availability_slots)から、今日以降の予約候補日リストを生成する。
// レコードが存在しない日は「受付可」とみなす。
export function buildCandidateDays(
  slotsByDate: Record<string, { am_available: boolean; pm_available: boolean }>,
  numDays = 14
) {
  const days: { key: string; label: string; am: boolean; pm: boolean }[] = [];
  for (let i = 1; i <= numDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = toDateKey(d);
    const slot = slotsByDate[key];
    const am = slot ? slot.am_available : true;
    const pm = slot ? slot.pm_available : true;
    if (!am && !pm) continue;
    days.push({ key, label: `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAY_LABELS[d.getDay()]}）`, am, pm });
  }
  return days;
}
