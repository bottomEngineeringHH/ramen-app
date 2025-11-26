// app/api/get-token/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// NextAuthが使っているのと同じNEXTAUTH_SECRET
const secret = process.env.NEXTAUTH_SECRET;

// GETリクエストハンドラ
export async function GET(req: NextRequest) {
  
  // getTokenはサーバーサイドでのみ実行可能
  // リクエスト(req)からHttpOnlyクッキーを読み取り、生のJWT文字列を取得
  const token = await getToken({ req: req as unknown as NextRequest, secret, raw: true });

  if (token) {
    // 生のJWTトークンをクライアントにJSONとして返す
    return NextResponse.json({ token });
  } else {
    // 認証されていない
    return new NextResponse('Unauthorized', { status: 401 });
  }
}