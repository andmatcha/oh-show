import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase!: SupabaseClient;

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Supabase configuration is missing. Please check your .env file.',
      );
    }

    // 管理操作用のクライアントを作成
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * JWTトークンを検証し、ユーザー情報を返す
   */
  async verifyToken(token: string) {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }

  /**
   * 招待用などのユーザー作成（パスワードなし）
   */
  async createUser(email: string, name: string) {
    const { data: { user }, error } = await this.supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error || !user) {
      throw new Error(`Failed to create user: ${error?.message}`);
    }

    return user;
  }

  /**
   * ユーザーのパスワードを更新
   */
  async updateUserPassword(uid: string, password: string) {
    const { error } = await this.supabase.auth.admin.updateUserById(uid, {
      password: password,
    });

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  /**
   * パスワードリセットリンク（または招待用リンク）の生成
   */
  async generatePasswordResetLink(email: string): Promise<string> {
    const { data, error } = await this.supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      },
    });

    if (error || !data.properties?.action_link) {
      throw new Error(`Failed to generate password reset link: ${error?.message}`);
    }

    return data.properties.action_link;
  }

  getAdminClient(): SupabaseClient {
    return this.supabase;
  }
}
