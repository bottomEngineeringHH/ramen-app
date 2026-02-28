// backend/src/ramen/ramen.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRamenDto } from './dto/create-ramen.dto';
import { UpdateRamenDto } from './dto/update-ramen.dto';
import { MESSAGES } from '../../../app/constants/messages_ja';

@Injectable()
export class RamenService {
  // PrismaServiceを注入（DI）
  constructor(private prisma: PrismaService) { }

  // 一覧情報取得
  async findAll() {
    // PrismaのfindMany()で全レビューを取得
    return this.prisma.ramenReview.findMany({
      // 関連するテーブルのデータも一緒に取得する（JOINのようなもの）
      include: {
        store: true,       // 店舗情報（店名、緯度経度）
        genre: true,       // ジャンル名
        noodle: true,      // 麺の種類名
        eatingScene: true, // シーン名
      },
      // 新しいレビューが上に来るように降順でソート
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ラーメンの登録処理
  async create(createRamenDto: CreateRamenDto, userId: string) {
    // 公序良俗チェック:
    // 不適切なコメントを検出するロジック
    if (this.containsInappropriateContent(createRamenDto.comment)) {
      throw new BadRequestException(MESSAGES.E_INCLUDE_INAPPROPRIATE_COMMENT);
    }

    // 1. 店舗情報が存在するか、店名で検索 (あれば取得、なければstoreはnull)
    let store = await this.prisma.ramenStore.findUnique({
      where: { name: createRamenDto.storeName },
    });

    // 2. 店舗が存在しない場合、新規作成
    if (!store) {
      store = await this.prisma.ramenStore.create({
        data: {
          name: createRamenDto.storeName,
          latitude: createRamenDto.latitude,
          longitude: createRamenDto.longitude,
          // addressはDTOにないので省略
        },
      });
    }

    // 3. レビュー情報（ユーザーの評価、マスタIDなど）をDBに登録
    const review = await this.prisma.ramenReview.create({
      data: {
        // スカラー値
        comment: createRamenDto.comment,
        vibe: createRamenDto.vibe,

        imageUrl: createRamenDto.imageUrl?.[0],

        // リレーション (connectを使用)
        store: {
          connect: { id: store.id }
        },
        genre: {
          connect: { id: createRamenDto.genreId }
        },
        noodle: {
          connect: { id: createRamenDto.noodleId }
        },
        eatingScene: {
          connect: { id: createRamenDto.eatingSceneId }
        },
        author: {
          connect: { id: userId }
        }
      },
    });

    return review;
  }

  // ラーメンの更新処理
  async update(id: number, updateRamenDto: UpdateRamenDto) {
    // 公序良俗チェック: コメントが更新された場合のみチェックする
    if (updateRamenDto.comment && this.containsInappropriateContent(updateRamenDto.comment)) {
      throw new BadRequestException(MESSAGES.E_INCLUDE_INAPPROPRIATE_COMMENT);
    }

    try {
      // 2. レビュー情報（RamenReview）の更新
      const updatedReview = await this.prisma.ramenReview.update({
        where: { id: id },
        data: {
          // 1. スカラー値（文字列や数値）はそのまま更新
          comment: updateRamenDto.comment,
          vibe: updateRamenDto.vibe,

          imageUrl: updateRamenDto.imageUrl?.[0],

          // 2. 外部キー（ID）は 'connect' を使ってリレーションを更新する
          //    'genreId: ...' ではなく 'genre: { connect: ... }' と書く
          genre: updateRamenDto.genreId
            ? { connect: { id: updateRamenDto.genreId } }
            : undefined,

          noodle: updateRamenDto.noodleId
            ? { connect: { id: updateRamenDto.noodleId } }
            : undefined,

          eatingScene: updateRamenDto.eatingSceneId
            ? { connect: { id: updateRamenDto.eatingSceneId } }
            : undefined,

          // 3. 'store' の更新ロジックもリレーション更新なのでOK
          store: {
            update: {
              name: updateRamenDto.storeName,
              latitude: updateRamenDto.latitude,
              longitude: updateRamenDto.longitude,
            }
          }
        },
        // 更新後のデータには関連情報も含める
        include: { store: true, genre: true, noodle: true, eatingScene: true }
      });
      return updatedReview;

    } catch (error) {
      // 存在しないIDを更新しようとした場合のエラー処理
      console.error(error); // サーバーログにエラー詳細を出力
      throw new NotFoundException(MESSAGES.E_INVALID_REVIEW_ID);
    }
  }

  // ラーメンの削除処理 (物理削除)
  async remove(id: number) {
    try {
      // レビューを削除
      const deletedReview = await this.prisma.ramenReview.delete({
        where: { id: id },
      });

      return deletedReview;
    } catch (error) {
      // 存在しないIDを削除しようとした場合のエラー処理
      console.error(error);
      throw new NotFoundException(MESSAGES.E_INVALID_REVIEW_ID);
    }
  }

  // 仮の公序良俗チェック関数（ここではシンプルな例として実装）
  private containsInappropriateContent(comment?: string): boolean {
    if (!comment) return false;
    const bannedWords = ['だめなワード', 'きんしくワード']; // TODO:実際はリスト化されたDBを参照
    return bannedWords.some(word => comment.includes(word));
  }

  async getMasters() {
    // Promise.allで複数のDBクエリを並行して実行し、高速化
    const [genres, noodleTypes, eatingScenes] = await Promise.all([
      this.prisma.genre.findMany(),
      this.prisma.noodleType.findMany(),
      this.prisma.eatingScene.findMany(),
    ]);

    return { genres, noodleTypes, eatingScenes };
  }

  // 特定のIDのラーメンレビューを取得する処理
  async findOne(id: number) {
    // PrismaのfindUniqueOrThrow()でID検索を実行
    return this.prisma.ramenReview.findUniqueOrThrow({
      where: { id },
      // 一覧と同じく、関連データも一緒に取得する
      include: {
        store: true,
        genre: true,
        noodle: true,
        eatingScene: true,
      },
    });
  }
}