// backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { NextAuthGuard } from './next-auth.guard';

@Module({
  imports: [],
  providers: [NextAuthGuard], // Guardをプロバイダーとして登録
  exports: [NextAuthGuard], // Guardをエクスポート
})
export class AuthModule {}