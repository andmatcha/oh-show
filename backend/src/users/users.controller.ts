import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  // 本人はリクエストで指定されたIDではなく、認証済みユーザーから特定する
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async findMe(@Req() req: Request) {
    return req.user!;
  }

  // UIDによる任意のユーザー検索は管理者のみ
  @Get('uid/:supabaseUid')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async findBySupabaseUid(@Param('supabaseUid') supabaseUid: string) {
    const user = await this.usersService.findBySupabaseUid(supabaseUid);
    if (!user) {
      throw new NotFoundException(
        `User with Supabase UID ${supabaseUid} not found`,
      );
    }
    return user;
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async create(
    @Body()
    createUserDto: {
      supabaseUid: string;
      email: string;
      name: string;
      role?: Role;
    },
  ) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: { name?: string; role?: Role },
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  @Post('invite')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  async invite(
    @Req() req: Request,
    @Body()
    inviteDto: {
      email: string;
      name: string;
      role?: Role;
      frontendUrl?: string;
    },
  ) {
    // フロントエンドURLを取得（優先順位：リクエストボディ > Originヘッダー > 環境変数）
    const frontendUrl =
      inviteDto.frontendUrl ||
      req.headers.origin ||
      req.headers.referer?.split('/').slice(0, 3).join('/') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

    return this.usersService.inviteUser(
      inviteDto.email,
      inviteDto.name,
      inviteDto.role || Role.STAFF,
      frontendUrl,
    );
  }

  @Get('invitation/:token')
  async verifyInvitation(@Param('token') token: string) {
    return this.usersService.verifyInvitationToken(token);
  }

  @Post('signup')
  async signup(
    @Body()
    signupDto: {
      token: string;
      password: string;
    },
  ) {
    return this.usersService.completeInvitation(
      signupDto.token,
      signupDto.password,
    );
  }
}
