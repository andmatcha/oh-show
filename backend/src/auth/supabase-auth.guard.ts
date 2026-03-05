import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    const token = authHeader.substring(7);

    try {
      const decodedUser = await this.supabaseService.verifyToken(token);

      // データベースからユーザー情報を取得
      let user = await this.usersService.findBySupabaseUid(decodedUser.id);

      // ユーザーが存在しない場合は新規作成（自動プロビジョニングが必要な場合）
      if (!user) {
        user = await this.usersService.create({
          supabaseUid: decodedUser.id,
          email: decodedUser.email || '',
          name: (decodedUser.user_metadata?.name as string) || decodedUser.email || 'Unknown',
        });
      }

      // リクエストオブジェクトにユーザー情報を追加
      request.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
