import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    const token = authHeader.substring(7);

    let decodedUser: User;
    try {
      decodedUser = await this.supabaseService.verifyToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Supabaseの認証だけでは入場を許可せず、招待登録済みの有効なユーザーを要求する。
    // DB障害は認証失敗として握りつぶさず、サーバーエラーとして伝播させる。
    const user = await this.usersService.findBySupabaseUid(decodedUser.id);
    if (!user || user.isDeleted) {
      throw new UnauthorizedException(
        'User is not registered or has been deleted',
      );
    }

    request.user = user;
    return true;
  }
}
