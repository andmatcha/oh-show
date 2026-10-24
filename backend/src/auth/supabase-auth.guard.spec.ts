import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';

describe('SupabaseAuthGuard', () => {
  it('DB障害を認証エラーに変換せず伝播させる', async () => {
    const databaseError = new Error('database connection timeout');
    const module = await Test.createTestingModule({
      providers: [
        SupabaseAuthGuard,
        {
          provide: SupabaseService,
          useValue: {
            verifyToken: jest.fn().mockResolvedValue({ id: 'valid-uid' }),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findBySupabaseUid: jest.fn().mockRejectedValue(databaseError),
          },
        },
      ],
    }).compile();
    const request = {
      headers: { authorization: 'Bearer valid-token' },
    } as Request;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    await expect(
      module.get(SupabaseAuthGuard).canActivate(context),
    ).rejects.toBe(databaseError);
    expect(databaseError).not.toBeInstanceOf(UnauthorizedException);
    expect(request.user).toBeUndefined();
    await module.close();
  });
});
