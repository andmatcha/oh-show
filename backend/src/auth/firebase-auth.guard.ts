import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private firebaseService: FirebaseService,
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
      const decodedToken = await this.firebaseService.verifyToken(token);

      // データベースからユーザー情報を取得
      let user = await this.usersService.findByFirebaseUid(decodedToken.uid);

      // ユーザーが存在しない場合は新規作成
      if (!user) {
        user = await this.usersService.create({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email || '',
          name: decodedToken.name || decodedToken.email || 'Unknown',
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
