import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role, User } from '@prisma/client';
import * as request from 'supertest';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('ユーザー管理APIのアクセス制御', () => {
  let app: INestApplication;
  let service: UsersService;
  const staff: User = {
    id: 'staff-id',
    supabaseUid: 'staff-uid',
    email: 'staff@example.invalid',
    name: 'スタッフ',
    role: Role.STAFF,
    isDeleted: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
  const admin: User = {
    ...staff,
    id: 'admin-id',
    supabaseUid: 'admin-uid',
    email: 'admin@example.invalid',
    role: Role.ADMIN,
  };
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    invitationToken: { create: jest.fn() },
  };
  const verifyToken = jest.fn();

  beforeAll(async () => {
    // 実際のモジュール構成・認証ガード・UsersServiceを使用し、外部通信だけを置換する。
    const module = await Test.createTestingModule({
      imports: [PrismaModule, SupabaseModule, UsersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(SupabaseService)
      .useValue({ verifyToken })
      .compile();
    service = module.get(UsersService);
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    verifyToken.mockImplementation(async (token: string) => {
      if (token === 'admin-token') return { id: admin.supabaseUid };
      if (token === 'staff-token') return { id: staff.supabaseUid };
      throw new Error('Invalid token');
    });
    prisma.user.findUnique.mockImplementation(async ({ where }) => {
      if (where.supabaseUid === staff.supabaseUid) return staff;
      if (where.supabaseUid === admin.supabaseUid) return admin;
      return null;
    });
    prisma.user.findMany.mockResolvedValue([staff, admin]);
    prisma.user.create.mockResolvedValue(staff);
    prisma.user.update.mockImplementation(async ({ where, data }) => ({
      ...staff,
      id: where.id,
      ...data,
    }));
    prisma.invitationToken.create.mockImplementation(async ({ data }) => data);
  });

  afterAll(async () => {
    await app.close();
  });

  const adminRoutes = [
    { method: 'get', path: '/api/users' },
    { method: 'get', path: '/api/users/staff-id' },
    { method: 'get', path: '/api/users/uid/staff-uid' },
    {
      method: 'post',
      path: '/api/users',
      body: {
        supabaseUid: 'new-uid',
        email: 'new@example.invalid',
        name: '新規',
        role: 'ADMIN',
      },
    },
    { method: 'patch', path: '/api/users/staff-id', body: { role: 'ADMIN' } },
    { method: 'delete', path: '/api/users/staff-id' },
    {
      method: 'post',
      path: '/api/users/invite',
      body: { email: 'new@example.invalid', name: '新規', role: 'ADMIN' },
    },
  ] as const;

  const send = (route: (typeof adminRoutes)[number], token?: string) => {
    const agent = request(app.getHttpServer());
    let call: request.Test;
    switch (route.method) {
      case 'get':
        call = agent.get(route.path);
        break;
      case 'post':
        call = agent.post(route.path);
        break;
      case 'patch':
        call = agent.patch(route.path);
        break;
      case 'delete':
        call = agent.delete(route.path);
        break;
    }
    if (token) call.set('Authorization', `Bearer ${token}`);
    if ('body' in route) call.send(route.body);
    return call;
  };

  it.each(adminRoutes)('未認証の$method $pathを拒否する', async (route) => {
    await send(route).expect(401);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.invitationToken.create).not.toHaveBeenCalled();
  });

  it.each(adminRoutes)('スタッフの$method $pathを拒否する', async (route) => {
    await send(route, 'staff-token').expect(403);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { supabaseUid: staff.supabaseUid },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.invitationToken.create).not.toHaveBeenCalled();
  });

  it.each(adminRoutes)('管理者の$method $pathを許可する', async (route) => {
    const response = await send(route, 'admin-token');
    expect(response.status).toBe(route.method === 'post' ? 201 : 200);
  });

  it('本人情報は未認証では取得できない', async () => {
    await request(app.getHttpServer()).get('/api/users/me').expect(401);
  });

  it('無効なトークンでは本人情報を取得できない', async () => {
    await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it.each(['staff-token', 'admin-token'])(
    '%sで本人情報を取得できる',
    async (token) => {
      const expectedUser = token === 'staff-token' ? staff : admin;
      const response = await request(app.getHttpServer())
        .get('/api/users/me?id=other-id&supabaseUid=other-uid')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(response.body.id).toBe(expectedUser.id);
      expect(response.body.supabaseUid).toBe(expectedUser.supabaseUid);
    },
  );

  it('招待トークンの検証はログインなしでサービスに委譲する', async () => {
    const verify = jest
      .spyOn(service, 'verifyInvitationToken')
      .mockResolvedValue({ token: 'invitation-token' } as never);
    await request(app.getHttpServer())
      .get('/api/users/invitation/invitation-token')
      .expect(200);
    expect(verify).toHaveBeenCalledWith('invitation-token');
  });

  it('招待登録はログインなしでトークン検証を行うサービスに委譲する', async () => {
    const complete = jest
      .spyOn(service, 'completeInvitation')
      .mockResolvedValue(staff);
    await request(app.getHttpServer())
      .post('/api/users/signup')
      .send({ token: 'invitation-token', password: 'test-password' })
      .expect(201);
    expect(complete).toHaveBeenCalledWith('invitation-token', 'test-password');
  });
});
