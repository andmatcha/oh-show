import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Shift } from '@prisma/client';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  // その月のシフトを取得
  async findByMonth(yearMonth: string): Promise<{
    yearMonth: string;
    shifts: Array<Shift & { user?: { id: string; name: string; email: string } }>;
    shiftMonth: { id: string; status: string } | null;
  }> {
    this.validateYearMonth(yearMonth);

    const [year, month] = yearMonth.split('-').map(Number);

    // ShiftMonthを取得
    const shiftMonth = await this.prisma.shiftMonth.findUnique({
      where: { yearMonth },
      select: { id: true, status: true },
    });

    // シフトを取得
    const shifts = await this.prisma.shift.findMany({
      where: {
        date: {
          gte: new Date(Date.UTC(year, month - 1, 1)),
          lt: new Date(Date.UTC(year, month, 1)),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { slot: 'asc' }],
    });

    return {
      yearMonth,
      shifts,
      shiftMonth,
    };
  }

  // シフトを保存
  async saveShifts(
    yearMonth: string,
    shifts: Array<{
      date: string;
      userId: string | null;
      isManual: boolean;
      slot: number;
    }>,
  ): Promise<{ message: string; count: number }> {
    this.validateYearMonth(yearMonth);

    // ShiftMonthを取得または作成
    const shiftMonth = await this.ensureShiftMonthExists(yearMonth);

    const [year, month] = yearMonth.split('-').map(Number);

    // トランザクションで既存のシフトを削除して新規作成
    await this.prisma.$transaction(async (tx) => {
      // 既存のシフトを削除
      await tx.shift.deleteMany({
        where: {
          shiftMonthId: shiftMonth.id,
        },
      });

      // 新しいシフトを作成
      await Promise.all(
        shifts.map((shift) => {
          const [y, m, d] = shift.date.split('-').map(Number);
          const date = new Date(Date.UTC(y, m - 1, d));

          return tx.shift.create({
            data: {
              shiftMonthId: shiftMonth.id,
              date,
              userId: shift.userId,
              isManual: shift.isManual,
              slot: shift.slot,
            },
          });
        }),
      );
    });

    return {
      message: 'Shifts saved successfully',
      count: shifts.length,
    };
  }

  // シフトを公開（statusをPUBLISHEDに変更）
  async publishShifts(yearMonth: string): Promise<{ message: string }> {
    this.validateYearMonth(yearMonth);

    const shiftMonth = await this.prisma.shiftMonth.findUnique({
      where: { yearMonth },
    });

    if (!shiftMonth) {
      throw new NotFoundException(`Shift month ${yearMonth} not found`);
    }

    await this.prisma.shiftMonth.update({
      where: { yearMonth },
      data: { status: 'PUBLISHED' },
    });

    return {
      message: `Shifts for ${yearMonth} have been published`,
    };
  }

  // 個別のシフトを更新
  async updateShift(
    id: string,
    userId: string | null,
    isManual: boolean,
  ): Promise<Shift> {
    return this.prisma.shift.update({
      where: { id },
      data: { userId, isManual },
    });
  }

  // その月のシフトを全削除
  async deleteByMonth(yearMonth: string): Promise<{ message: string; count: number }> {
    this.validateYearMonth(yearMonth);

    const shiftMonth = await this.prisma.shiftMonth.findUnique({
      where: { yearMonth },
    });

    if (!shiftMonth) {
      throw new NotFoundException(`Shift month ${yearMonth} not found`);
    }

    const result = await this.prisma.shift.deleteMany({
      where: {
        shiftMonthId: shiftMonth.id,
      },
    });

    return {
      message: `All shifts for ${yearMonth} have been deleted`,
      count: result.count,
    };
  }

  // シフト自動生成（次のタスクで実装）
  async generateShifts(
    yearMonth: string,
    requirements: Record<string, number>,
    manualShifts: Array<{ date: string; userId: string; slot: number }>,
  ): Promise<{
    shifts: Array<{
      date: string;
      userId: string | null;
      isManual: boolean;
      slot: number;
    }>;
  }> {
    // TODO: 自動生成アルゴリズムの実装
    // 現在はダミー実装
    return {
      shifts: [],
    };
  }

  // バリデーション
  private validateYearMonth(yearMonth: string): void {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(yearMonth)) {
      throw new BadRequestException('Invalid yearMonth format. Expected YYYY-MM');
    }

    const [year, month] = yearMonth.split('-').map(Number);
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 01 and 12');
    }
  }

  private async ensureShiftMonthExists(yearMonth: string) {
    const shiftMonth = await this.prisma.shiftMonth.findUnique({
      where: { yearMonth },
    });

    if (!shiftMonth) {
      throw new NotFoundException(
        `Shift month ${yearMonth} not found. Please create it first.`,
      );
    }

    return shiftMonth;
  }
}
