import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  async createInvitation(
    email: string,
    name: string,
    role: Role = 'STAFF',
  ): Promise<{
    token: string;
    invitationUrl: string;
    expiresAt: Date;
  }> {
    // バリデーション
    this.validateEmail(email);
    this.validateName(name);

    // 既に登録済みのメールアドレスかチェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException(
        'このメールアドレスは既に登録されています',
      );
    }

    // 既存の未使用トークンがあれば削除
    await this.prisma.invitationToken.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    // ランダムトークンを生成（32バイト = 64文字の16進数）
    const token = randomBytes(32).toString('hex');

    // 有効期限を7日後に設定
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // InvitationTokenレコードを作成
    await this.prisma.invitationToken.create({
      data: {
        token,
        email,
        name,
        role,
        expiresAt,
      },
    });

    // 招待URLを生成（フロントエンドの登録画面URL）
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const invitationUrl = `${baseUrl}/signup?token=${token}`;

    return {
      token,
      invitationUrl,
      expiresAt,
    };
  }

  async verifyToken(token: string): Promise<{
    email: string;
    name: string;
    role: Role;
  }> {
    const invitation = await this.prisma.invitationToken.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new BadRequestException('無効な招待トークンです');
    }

    if (invitation.used) {
      throw new BadRequestException('この招待トークンは既に使用されています');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('この招待トークンは期限切れです');
    }

    return {
      email: invitation.email,
      name: invitation.name,
      role: invitation.role,
    };
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await this.prisma.invitationToken.update({
      where: { token },
      data: { used: true },
    });
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('有効なメールアドレスを入力してください');
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('名前を入力してください');
    }

    if (name.length > 50) {
      throw new BadRequestException('名前は50文字以内で入力してください');
    }
  }
}
