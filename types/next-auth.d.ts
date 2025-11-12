// types/next-auth.d.ts

import NextAuth, { DefaultSession, User } from "next-auth"
import { JWT } from "next-auth/jwt"

// NextAuthモジュール全体を上書き（拡張）する宣言
declare module "next-auth" {
  /**
   * useSession() や getSession() で返される Session オブジェクトの型
   */
  interface Session {
    user: {
      /** データベースのユーザーID */
      id: string;
    } & DefaultSession["user"] // 既存の name, email, image を継承
  }

  /**
   * PrismaAdapterから返されるUserモデルの型
   * (PrismaのUserモデルと一致させる)
   */
  // interface User {
  //   id: string;
  // }
}

// JWTモジュールを上書き（拡張）する宣言
declare module "next-auth/jwt" {
  /**
   * 1. jwtコールバックの token 引数の型
   */
  interface JWT {
    /** データベースのユーザーID (token.sub) */
    sub: string;
  }
}