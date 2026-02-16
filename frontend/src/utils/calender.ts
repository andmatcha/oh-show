import dayjs from "dayjs";

type DayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type DayLabel = "日" | "月" | "火" | "水" | "木" | "金" | "土";
type MonthlyCalender = {
  date: number | undefined;
  day: DayNumber | undefined;
}[][];

class Calender {
  private static dayNumbers: DayNumber[] = [0, 1, 2, 3, 4, 5, 6];
  private static dayLabels: DayLabel[] = [
    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土",
  ];
  private year: number;
  private month: number; // 1~12

  constructor(year: number, month: number) {
    this.year = year;
    this.month = month;
  }

  private getDatesInMonth = (): number[] => {
    const lastDate = dayjs(`${this.year}/${this.month}`).endOf("month").date();
    return Array.from({ length: lastDate }, (_, i) => i + 1);
  };

  private getFirstDay = (): DayNumber => {
    return dayjs(`${this.year}/${this.month}/1`).day();
  };

  getMonthlyCalender = (): MonthlyCalender => {
    const dates = this.getDatesInMonth();
    const monthlyCalender = [];
    let day = this.getFirstDay();
    let week: {
      date: number | undefined;
      day: DayNumber | undefined;
    }[] = [];
    for (const date of dates) {
      if (day > Calender.dayNumbers.length - 1) {
        monthlyCalender.push(week);
        day = day - Calender.dayNumbers.length;
        week = [];
      }
      week.push({ date, day: Calender.dayNumbers[day] });
      day++;
    }
    monthlyCalender.push(week);
    while (monthlyCalender[0].length < 7) {
      monthlyCalender[0].unshift({ date: undefined, day: undefined });
    }
    while (monthlyCalender[monthlyCalender.length - 1].length < 7) {
      monthlyCalender[monthlyCalender.length - 1].push({
        date: undefined,
        day: undefined,
      });
    }

    return monthlyCalender;
  };

  getPrev = (): { year: number; month: number } => {
    if (this.month == 1) {
      return { year: this.year - 1, month: 12 };
    } else {
      return { year: this.year, month: this.month - 1 };
    }
  };

  getNext = (): { year: number; month: number } => {
    if (this.month == 12) {
      return { year: this.year + 1, month: 1 };
    } else {
      return { year: this.year, month: this.month + 1 };
    }
  };

  static getDayLabels = () => {
    return Calender.dayLabels;
  };

  static getDayLabel = (dayNumber: DayNumber) => {
    return Calender.dayLabels[dayNumber];
  };
}

export { Calender };
