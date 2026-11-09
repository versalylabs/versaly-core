import { SocialChannel, ContentCategory } from "@/data/marketing-seed";
import { todayIsoDate } from "@/lib/ids";
import { addDaysIso } from "@/lib/money";

export const STORAGE_KEY = "versaly_marketing_posts_v2";

export const CHANNELS: SocialChannel[] = [
  "LinkedIn",
  "X / Twitter",
  "TikTok",
  "Instagram",
  "Facebook",
  "YouTube Shorts",
];

export const CATEGORIES: ContentCategory[] = [
  "Educational / Case Study",
  "Product Demo Reel",
  "Customer Pain Point",
  "Launch Announcement",
  "Behind The Scenes",
  "eTIMS Compliance Tip",
];

export const STREAK_STORAGE_KEY = "versaly_marketing_streak_days_v2";

export interface WeekDayItem {
  dayShort: string;
  dayName: string;
  dateStr: string;
  dayNum: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isSunday: boolean;
}

export function getCurrentWeekDays(): WeekDayItem[] {
  // Worked out from the Nairobi calendar day so the week never shifts by a day
  const today = todayIsoDate();
  const dayOfWeek = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0 is Sun, 1 is Mon...
  const mondayIso = addDaysIso(today, dayOfWeek === 0 ? -6 : 1 - dayOfWeek);

  const daysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daysFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return daysShort.map((dayShort, idx) => {
    const dateStr = addDaysIso(mondayIso, idx);
    return {
      dayShort,
      dayName: daysFull[idx],
      dateStr,
      dayNum: Number(dateStr.slice(8, 10)),
      isToday: dateStr === today,
      isPast: dateStr < today,
      isFuture: dateStr > today,
      isSunday: idx === 6,
    };
  });
}
