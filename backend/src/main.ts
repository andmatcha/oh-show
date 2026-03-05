import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS設定
  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Originがない場合（サーバー間通信やヘルスチェック）は許可
      if (!origin) {
        callback(null, true);
        return;
      }

      // 開発環境では全てのlocalhostポートを許可
      if (isDevelopment) {
        if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
          callback(null, true);
          return;
        }
      }

      // 本番環境または開発環境で外部からのリクエストの場合
      const allowedOrigins = process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : ['http://localhost:3000'];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // APIプレフィックス
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 5050;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
}
void bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
