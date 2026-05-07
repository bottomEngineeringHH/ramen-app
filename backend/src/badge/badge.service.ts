import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGES } from '../../../app/constants/messages_ja';

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  constructor(private prisma: PrismaService) {}

  async checkAndAwardBadges(userId: string) {
    await this.checkGenreMaster(userId); // 汎用ジャンルマスター判定
    // (にんにく等、特定の条件があればここに追加)
  }

  // 汎用：ジャンルマスター判定
  private async checkGenreMaster(userId: string) {
    // ユーザーの全レビューを取得
    const userReviews = await this.prisma.ramenReview.findMany({
      where: { authorId: userId },
      include: { genre: true },
    });

    // ジャンルごとに「訪れた異なる店舗のID」をSetで管理して重複を排除
    const genreStoreMap: Record<string, Set<number>> = {};
    
    for (const review of userReviews) {
      if (review.genre && review.storeId) {
        const genreName = review.genre.name;
        if (!genreStoreMap[genreName]) {
          genreStoreMap[genreName] = new Set();
        }
        genreStoreMap[genreName].add(review.storeId);
      }
    }

    // 異なる30店舗以上を制覇しているジャンルがあれば称号を付与
    for (const [genreName, storeSet] of Object.entries(genreStoreMap)) {
      if (storeSet.size >= 30) {
        await this.awardDynamicBadge(
          userId, 
          `${genreName}マスター`, 
          `${genreName}ラーメンを30店舗制覇した証`, 
          '👑' // 称号のアイコン
        );
      }
    }
  }

  // 動的バッジ付与システム（マスタに無ければ自動で作成）
  private async awardDynamicBadge(userId: string, name: string, description: string, icon: string) {
    // upsert: バッジ名が存在しなければ新規作成、あれば取得する
    const badge = await this.prisma.badge.upsert({
      where: { name },
      update: {},
      create: { name, description, icon },
    });

    // すでにこのユーザーが持っているか確認
    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });

    if (!existing) {
      await this.prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      this.logger.log(MESSAGES.I_BADGE_AWARDED(userId, name));
    }
  }
}