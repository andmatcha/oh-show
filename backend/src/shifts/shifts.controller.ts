import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ShiftsService } from './shifts.service';

@Controller('shifts')
@UseGuards(FirebaseAuthGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  // GET /api/shifts?yearMonth=YYYY-MM - その月のシフトを取得
  @Get()
  async findByMonth(@Query('yearMonth') yearMonth: string) {
    return this.shiftsService.findByMonth(yearMonth);
  }

  // POST /api/shifts - シフトを保存（管理者のみ）
  @Post()
  async saveShifts(
    @Req() req: Request,
    @Body()
    body: {
      yearMonth: string;
      shifts: Array<{
        date: string;
        userId: string | null;
        isManual: boolean;
        slot: number;
      }>;
    },
  ) {
    // 管理者権限チェック
    if (req.user!.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return this.shiftsService.saveShifts(body.yearMonth, body.shifts);
  }

  // POST /api/shifts/generate - 自動生成（管理者のみ）
  @Post('generate')
  async generateShifts(
    @Req() req: Request,
    @Body()
    body: {
      yearMonth: string;
      requirements: Record<string, number>; // { "2026-03-01": 1, "2026-03-02": 2, ... }
      manualShifts?: Array<{ date: string; userId: string; slot: number }>; // 手動設定済みのシフト
    },
  ) {
    // 管理者権限チェック
    if (req.user!.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return this.shiftsService.generateShifts(
      body.yearMonth,
      body.requirements,
      body.manualShifts || [],
    );
  }

  // POST /api/shifts/publish?yearMonth=YYYY-MM - シフトを公開（管理者のみ）
  @Post('publish')
  async publishShifts(
    @Req() req: Request,
    @Query('yearMonth') yearMonth: string,
  ) {
    // 管理者権限チェック
    if (req.user!.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return this.shiftsService.publishShifts(yearMonth);
  }

  // PATCH /api/shifts/:id - 個別のシフトを更新（管理者のみ）
  @Patch(':id')
  async updateShift(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { userId: string | null; isManual: boolean },
  ) {
    // 管理者権限チェック
    if (req.user!.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return this.shiftsService.updateShift(id, body.userId, body.isManual);
  }

  // DELETE /api/shifts?yearMonth=YYYY-MM - その月のシフトを全削除（管理者のみ）
  @Delete()
  async deleteByMonth(
    @Req() req: Request,
    @Query('yearMonth') yearMonth: string,
  ) {
    // 管理者権限チェック
    if (req.user!.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return this.shiftsService.deleteByMonth(yearMonth);
  }
}
