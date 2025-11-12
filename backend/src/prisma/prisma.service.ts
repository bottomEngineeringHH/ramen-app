// backend/src/prisma/prisma.service.ts (修正後)

import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
// OnModuleInitだけでなく、OnModuleDestroyインターフェースも実装します。
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super(); 
  }

  // アプリケーション起動時: データベースに接続
  async onModuleInit() {
    await this.$connect();
    console.log('PrismaService: Database connected successfully.');
  }

  // アプリケーション終了時: データベース接続を安全に切断
  async onModuleDestroy() {
    await this.$disconnect(); // $disconnect()を使って接続を閉じます
  }
}