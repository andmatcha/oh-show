import { Module } from '@nestjs/common';
import { ShiftMonthsController } from './shift-months.controller';
import { ShiftMonthsService } from './shift-months.service';

@Module({
  controllers: [ShiftMonthsController],
  providers: [ShiftMonthsService],
  exports: [ShiftMonthsService],
})
export class ShiftMonthsModule {}
