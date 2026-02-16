import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { InvitationsService } from './invitations.service';
import { Role } from '@prisma/client';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  // POST /api/invitations - 招待トークン生成（管理者のみ）
  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createInvitation(
    @Req() req: Request,
    @Body()
    createDto: {
      email: string;
      name: string;
      role?: Role;
    },
  ) {
    // 管理者権限チェック
    if (req.user!.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return this.invitationsService.createInvitation(
      createDto.email,
      createDto.name,
      createDto.role || 'STAFF',
    );
  }

  // GET /api/invitations/verify?token=xxx - トークン検証（認証不要）
  @Get('verify')
  async verifyToken(@Query('token') token: string) {
    return this.invitationsService.verifyToken(token);
  }
}
