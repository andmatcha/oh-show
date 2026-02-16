import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ShiftRequestsService } from './shift-requests.service';

@Controller('shift-requests')
@UseGuards(FirebaseAuthGuard) // 全エンドポイントで認証必須
export class ShiftRequestsController {
  constructor(private readonly shiftRequestsService: ShiftRequestsService) {}

  // POST /api/shift-requests - シフト提出・再提出
  @Post()
  async submit(
    @Req() req: Request,
    @Body()
    submitDto: {
      yearMonth: string; // "YYYY-MM"形式
      dates: number[]; // [1, 3, 5, 10, ...]
    },
  ) {
    const userId = req.user!.id;
    return this.shiftRequestsService.submitShiftRequests(
      userId,
      submitDto.yearMonth,
      submitDto.dates,
    );
  }

  // GET /api/shift-requests?yearMonth=YYYY-MM - 既存シフト取得
  @Get()
  async findByUser(
    @Req() req: Request,
    @Query('yearMonth') yearMonth: string,
  ) {
    const userId = req.user!.id;
    const shiftRequests =
      await this.shiftRequestsService.findUserShiftRequests(userId, yearMonth);

    // フロントエンド用に日付の配列に変換（UTC基準）
    const dates = shiftRequests.map((sr) => sr.date.getUTCDate());

    return {
      yearMonth,
      dates,
      shiftRequests,
    };
  }
}
