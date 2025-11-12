// backend/src/main.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// process.cwd() は 'npm run start:dev' を実行した場所 (D:\RamenApp\ramen-app) を指す
const envPath = path.resolve(process.cwd(), '.env');

// .env ファイルを明示的に読み込む
dotenv.config({ path: envPath });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // NestJSアプリケーションのインスタンスを作成
  const app = await NestFactory.create(AppModule);

  // CORSを有効にする設定 (フロントエンドの3000番ポートからのアクセスを許可するため)
  app.enableCors({
    origin: 'http://localhost:3000', // Next.jsアプリのオリジン
    credentials: true,
  });

  // グローバルバリデーションパイプを有効化
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // DTOクラスへの自動変換を有効化（@Typeデコレーターが機能するために必須）
    whitelist: true, // DTOに定義されていないプロパティを自動的に取り除く
  }));

  // 💡 ポート番号3001でサーバーを起動（Next.jsの3000と競合しないように）
  await app.listen(3001);
  console.log(`NestJS Application is running on: ${await app.getUrl()}`);
}
bootstrap();