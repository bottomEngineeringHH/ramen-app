// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service'; // PrismaServiceをインポート
import { RamenModule } from './ramen/ramen.module';
import { AuthModule } from './auth/auth.module';

// @Module デコレーター: このファイルがNestJSのモジュールであることを定義
@Module({
  imports: [
    RamenModule,
    AuthModule, // AuthModuleをインポート
  ],
  controllers: [], // APIエンドポイントを定義するコントローラーがあればここに追加
  
  // providers: アプリケーション全体で共有し、他のサービスやコントローラーに注入
  providers: [PrismaService], 
})
export class AppModule {}