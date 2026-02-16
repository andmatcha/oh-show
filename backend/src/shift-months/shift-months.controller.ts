import { Controller, Get } from '@nestjs/common';
import { ShiftMonthsService } from './shift-months.service';

@Controller('shift-months')
export class ShiftMonthsController {
  constructor(private readonly shiftMonthsService: ShiftMonthsService) {}

  // GET /api/shift-months/current - 現在OPEN状態のシフト月を取得
  @Get('current')
  async getCurrentOpenMonth() {
    const shiftMonth = await this.shiftMonthsService.getCurrentOpenMonth();

    return {
      yearMonth: shiftMonth.yearMonth,
      openAt: shiftMonth.openAt,
      closeAt: shiftMonth.closeAt,
      status: shiftMonth.status,
    };
  }
}
