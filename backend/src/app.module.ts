import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ShiftRequestsModule } from './shift-requests/shift-requests.module';

@Module({
  imports: [
    PrismaModule,
    FirebaseModule,
    UsersModule,
    AuthModule,
    ShiftRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
