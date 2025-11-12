// lib/prisma.ts

import { PrismaClient } from '@prisma/client'

// グローバルスコープにPrismaClientを型定義
declare global {
  var prisma: PrismaClient | undefined
}

// 開発環境ではグローバルインスタンスを使い、不要な接続を増やさない
export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma