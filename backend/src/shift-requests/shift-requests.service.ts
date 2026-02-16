import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShiftRequest } from '@prisma/client';

@Injectable()
export class ShiftRequestsService {
  constructor(private prisma: PrismaService) {}

  async submitShiftRequests(
    userId: string,
    yearMonth: string,
    dates: number[],
  ): Promise<{ message: string; count: number; shiftRequests: ShiftRequest[] }> {
    // 1. バリデーション
    this.validateYearMonth(yearMonth);

    // 2. 月曜日を除外（定休日なので自動除外）
    const [year, month] = yearMonth.split('-').map(Number);
    const validDates = dates.filter((date) => {
      const dayOfWeek = new Date(Date.UTC(year, month - 1, date)).getUTCDay();
      return dayOfWeek !== 1; // 月曜日（day=1）を除外
    });

    this.validateDates(yearMonth, validDates);

    // 3. 提出期間チェック（15日-20日）
    this.validateSubmissionPeriod();

    // 4. ShiftMonthレコードの存在確認（管理者が事前作成済みか確認）
    await this.ensureShiftMonthExists(yearMonth);

    // 5. 日付をDateTime配列に変換（UTC午前0時で統一）
    const dateTimes = validDates.map((date) => new Date(Date.UTC(year, month - 1, date)));

    // 5. トランザクションでDELETE + CREATE
    const shiftRequests = await this.prisma.$transaction(async (tx) => {
      // 既存のシフトリクエストを削除
      await tx.shiftRequest.deleteMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.UTC(year, month - 1, 1)),
            lt: new Date(Date.UTC(year, month, 1)),
          },
        },
      });

      // 新しいシフトリクエストを作成
      const created = await Promise.all(
        dateTimes.map((date) =>
          tx.shiftRequest.create({
            data: { userId, date },
          }),
        ),
      );

      return created;
    });

    return {
      message: 'Shift requests submitted successfully',
      count: shiftRequests.length,
      shiftRequests,
    };
  }

  async findUserShiftRequests(
    userId: string,
    yearMonth: string,
  ): Promise<ShiftRequest[]> {
    this.validateYearMonth(yearMonth);

    const [year, month] = yearMonth.split('-').map(Number);

    return this.prisma.shiftRequest.findMany({
      where: {
        userId,
        date: {
          gte: new Date(Date.UTC(year, month - 1, 1)),
          lt: new Date(Date.UTC(year, month, 1)),
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  private validateYearMonth(yearMonth: string): void {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(yearMonth)) {
      throw new BadRequestException(
        'Invalid yearMonth format. Expected YYYY-MM',
      );
    }

    const [year, month] = yearMonth.split('-').map(Number);
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 01 and 12');
    }
  }

  private validateDates(yearMonth: string, dates: number[]): void {
    if (!Array.isArray(dates) || dates.length === 0) {
      throw new BadRequestException(
        'Dates array is required and must not be empty',
      );
    }

    const [year, month] = yearMonth.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();

    for (const date of dates) {
      if (date < 1 || date > lastDay) {
        throw new BadRequestException(
          `Invalid date ${date} for ${yearMonth}`,
        );
      }
    }
  }

  private validateSubmissionPeriod(): void {
    const now = new Date();
    const currentDate = now.getDate();

    if (currentDate < 15 || currentDate > 20) {
      throw new ForbiddenException(
        'Shift submission is only allowed between 15th and 20th of each month',
      );
    }
  }

  private async ensureShiftMonthExists(yearMonth: string): Promise<void> {
    const shiftMonth = await this.prisma.shiftMonth.findUnique({
      where: { yearMonth },
    });

    if (!shiftMonth) {
      throw new BadRequestException(
        `Shift month ${yearMonth} has not been set up yet. Please contact administrator.`,
      );
    }

    if (shiftMonth.status !== 'OPEN') {
      throw new ForbiddenException(
        `Shift month ${yearMonth} is ${shiftMonth.status}. Submissions are not allowed.`,
      );
    }
  }
}
