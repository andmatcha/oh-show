import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShiftMonth } from '@prisma/client';

@Injectable()
export class ShiftMonthsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 現在OPEN状態のシフト月を取得
   * 複数ある場合は updated_at が最新のものを返す
   */
  async getCurrentOpenMonth(): Promise<ShiftMonth> {
    const openMonth = await this.prisma.shiftMonth.findFirst({
      where: {
        status: 'OPEN',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!openMonth) {
      throw new NotFoundException(
        'No open shift month found. Please contact administrator.',
      );
    }

    return openMonth;
  }
}
