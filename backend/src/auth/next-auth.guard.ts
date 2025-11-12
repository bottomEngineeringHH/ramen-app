// backend/src/auth/next-auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { decode } from 'next-auth/jwt';

// .envから秘密鍵を読み込む
const secret = process.env.NEXTAUTH_SECRET;

@Injectable()
export class NextAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. ヘッダーから 'Authorization: Bearer <token>' を取得
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid');
    }
    const token = authHeader.split(' ')[1];

    if (!secret) {
      throw new UnauthorizedException('Auth secret is not configured on backend');
    }

    try {
      // 'next-auth/jwt' を使ってJWEトークンを解読
      // (秘密鍵が一致すれば、JWE/JWSのアルゴリズムを自動で処理してくれる)
      const payload = await decode({ token, secret });

      if (!payload) {
        throw new Error('Invalid token (payload is null)');
      }

      // 解読成功。ペイロードをリクエストに添付
      // (JwtStrategyのvalidateメソッドと同じ役割)
      request.user = {
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
      };
      return true; // 認証成功

    } catch (error) {
      // 解読失敗 (不正なトークン、期限切れ、秘密鍵の不一致)
      console.error("JWE Decryption Error:", error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}