import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ShiftRequestsModule } from './shift-requests/shift-requests.module';
import { ShiftMonthsModule } from './shift-months/shift-months.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    PrismaModule,
    FirebaseModule,
    UsersModule,
    AuthModule,
    ShiftRequestsModule,
    ShiftMonthsModule,
    InvitationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
