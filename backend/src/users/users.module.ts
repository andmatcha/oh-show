import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SupabaseAuthGuard, AdminGuard],
  exports: [UsersService],
})
export class UsersModule {}
