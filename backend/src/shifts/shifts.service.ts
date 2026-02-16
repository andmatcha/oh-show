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

  // シフト自動生成（グリーディアルゴリズム）
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
    this.validateYearMonth(yearMonth);

    const [year, month] = yearMonth.split('-').map(Number);

    // 全ユーザーを取得（削除されていないユーザーのみ）
    const users = await this.prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
    });

    // ユーザーごとのシフトリクエストを取得
    const shiftRequests = await this.prisma.shiftRequest.findMany({
      where: {
        date: {
          gte: new Date(Date.UTC(year, month - 1, 1)),
          lt: new Date(Date.UTC(year, month, 1)),
        },
      },
    });

    // ユーザーIDと日付のマップを作成（高速検索用）
    const requestMap = new Map<string, Set<number>>();
    shiftRequests.forEach((req) => {
      const userId = req.userId;
      const day = req.date.getUTCDate();
      if (!requestMap.has(userId)) {
        requestMap.set(userId, new Set());
      }
      requestMap.get(userId)!.add(day);
    });

    // 手動設定済みのシフトをマップに変換
    const manualShiftMap = new Map<string, string>(); // key: "date-slot", value: userId
    manualShifts.forEach((shift) => {
      manualShiftMap.set(`${shift.date}-${shift.slot}`, shift.userId);
    });

    // 結果のシフト配列
    const resultShifts: Array<{
      date: string;
      userId: string | null;
      isManual: boolean;
      slot: number;
    }> = [];

    // ユーザーごとのアサイン状況を追跡
    const userAssignments = new Map<string, number[]>(); // userId -> [assigned dates]
    users.forEach((user) => {
      userAssignments.set(user.id, []);
    });

    // 手動設定済みのシフトを結果に追加
    manualShifts.forEach((shift) => {
      resultShifts.push({
        ...shift,
        isManual: true,
      });
      const [y, m, d] = shift.date.split('-').map(Number);
      userAssignments.get(shift.userId)!.push(d);
    });

    // 日付順にシフトを割り当て
    const lastDay = new Date(year, month, 0).getDate();
    for (let day = 1; day <= lastDay; day++) {
      const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

      // 月曜日（定休日）はスキップ
      if (dayOfWeek === 1) {
        continue;
      }

      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const requiredCount = requirements[dateStr] || this.getDefaultRequirement(dayOfWeek);

      // 各スロットに割り当て
      for (let slot = 1; slot <= requiredCount; slot++) {
        // 手動設定済みの場合はスキップ
        if (manualShiftMap.has(`${dateStr}-${slot}`)) {
          continue;
        }

        // 割り当て可能なユーザーを探す
        const assignedUser = this.findBestUser(
          users,
          day,
          requestMap,
          userAssignments,
        );

        resultShifts.push({
          date: dateStr,
          userId: assignedUser?.id || null,
          isManual: false,
          slot,
        });

        if (assignedUser) {
          userAssignments.get(assignedUser.id)!.push(day);
        }
      }
    }

    return { shifts: resultShifts };
  }

  // 最適なユーザーを選択（グリーディアルゴリズム）
  private findBestUser(
    users: Array<{ id: string; name: string }>,
    day: number,
    requestMap: Map<string, Set<number>>,
    userAssignments: Map<string, number[]>,
  ): { id: string; name: string } | null {
    // 候補ユーザーをスコア付けして選択
    const candidates = users
      .map((user) => {
        const hasRequest = requestMap.get(user.id)?.has(day) || false;
        const assignedDays = userAssignments.get(user.id) || [];
        const assignedCount = assignedDays.length;

        // 直近2日間にアサインされているかチェック（3連続を防ぐ）
        const isConsecutive = assignedDays.includes(day - 1) && assignedDays.includes(day - 2);

        // スコア計算
        let score = 0;
        if (hasRequest) score += 100; // 希望を出している: +100
        score -= assignedCount * 10; // アサイン数が少ないほど優先: -10 * count
        if (isConsecutive) score -= 1000; // 3連続になる場合: -1000（大きなペナルティ）

        return { user, score, isConsecutive };
      })
      .filter((c) => !c.isConsecutive) // 3連続になるユーザーを除外
      .sort((a, b) => b.score - a.score); // スコア順にソート

    // 最もスコアが高いユーザーを選択
    if (candidates.length > 0) {
      return candidates[0].user;
    }

    // 3連続を許容しても候補がいない場合
    const allCandidates = users
      .map((user) => {
        const assignedDays = userAssignments.get(user.id) || [];
        const assignedCount = assignedDays.length;
        return { user, assignedCount };
      })
      .sort((a, b) => a.assignedCount - b.assignedCount);

    return allCandidates.length > 0 ? allCandidates[0].user : null;
  }

  // デフォルトの募集人数を取得
  private getDefaultRequirement(dayOfWeek: number): number {
    // 0: 日曜, 1: 月曜, ..., 6: 土曜
    if (dayOfWeek === 1) return 0; // 月曜日（定休日）
    if (dayOfWeek === 5 || dayOfWeek === 6) return 2; // 金曜・土曜
    return 1; // その他の曜日
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
