import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { User, Role } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    firebaseUid: string;
    email: string;
    name: string;
    role?: Role;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        firebaseUid: data.firebaseUid,
        email: data.email,
        name: data.name,
        role: data.role || Role.STAFF,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      role?: Role;
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async inviteUser(
    email: string,
    name: string,
    role: Role = Role.STAFF,
    frontendUrl?: string,
  ): Promise<{ inviteLink: string; token: any }> {
    // すでに存在するか確認
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // ランダムなトークンを生成（32バイト = 64文字の16進数）
    const token = randomBytes(32).toString('hex');

    // 有効期限を1時間後に設定
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // データベースに招待トークンを保存
    const invitationToken = await this.prisma.invitationToken.create({
      data: {
        token,
        email,
        name,
        role,
        expiresAt,
      },
    });

    // フロントエンドのURLを使用（引数で渡されなければ環境変数またはデフォルト値）
    const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/signup?token=${token}`;

    return { inviteLink, token: invitationToken };
  }

  async verifyInvitationToken(token: string) {
    const invitationToken = await this.prisma.invitationToken.findUnique({
      where: { token },
    });

    if (!invitationToken) {
      throw new Error('Invalid token');
    }

    if (invitationToken.used) {
      throw new Error('Token already used');
    }

    if (new Date() > invitationToken.expiresAt) {
      throw new Error('Token expired');
    }

    return invitationToken;
  }

  async completeInvitation(token: string, password: string): Promise<User> {
    // トークンを検証
    const invitationToken = await this.verifyInvitationToken(token);

    // Firebase Authにユーザーを作成
    const firebaseUser = await this.firebaseService.createUser(
      invitationToken.email,
      invitationToken.name,
    );

    // Firebaseでパスワードを設定
    await this.firebaseService.getAuth().updateUser(firebaseUser.uid, {
      password,
    });

    // データベースにユーザーを作成
    const user = await this.create({
      firebaseUid: firebaseUser.uid,
      email: invitationToken.email,
      name: invitationToken.name,
      role: invitationToken.role,
    });

    // トークンを使用済みにする
    await this.prisma.invitationToken.update({
      where: { token },
      data: { used: true },
    });

    return user;
  }
}
