import { Module } from '@nestjs/common';
import { ShiftRequestsController } from './shift-requests.controller';
import { ShiftRequestsService } from './shift-requests.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ShiftRequestsController],
  providers: [ShiftRequestsService],
  exports: [ShiftRequestsService],
})
export class ShiftRequestsModule {}
