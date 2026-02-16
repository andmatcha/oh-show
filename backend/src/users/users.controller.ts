import { Controller, Get, Post, Body, Param, Patch, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('firebase/:firebaseUid')
  async findByFirebaseUid(@Param('firebaseUid') firebaseUid: string) {
    return this.usersService.findByFirebaseUid(firebaseUid);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  async create(
    @Body()
    createUserDto: {
      firebaseUid: string;
      email: string;
      name: string;
      role?: Role;
    },
  ) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: { name?: string; role?: Role },
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  @Post('invite')
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
