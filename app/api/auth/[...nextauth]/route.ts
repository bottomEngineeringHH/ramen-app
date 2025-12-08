// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github" // GitHubプロバイダー
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma" // 4-1で作成したPrismaインスタンス

console.log("---------------------------------------------------");
console.log("DEBUG: GITHUB_ID value:", process.env.GITHUB_ID); 
console.log("DEBUG: GITHUB_SECRET exists?", !!process.env.GITHUB_SECRET);
console.log("---------------------------------------------------");

// NextAuthのハンドラを定義
const handler = NextAuth({
  // データベースアダプタの設定
  // これによりNextAuthがPrisma DBを使ってユーザーデータを管理する
  adapter: PrismaAdapter(prisma),
  
  // プロバイダー（ログイン方法）の設定
  providers: [
    GitHub({
      // .env.localからIDとシークレットを取得
      clientId: process.env.GITHUB_ID ?? "", 
      clientSecret: process.env.GITHUB_SECRET ?? "", 
    }),
    // 他にGoogleなどもここに追加できる
  ],
  
  // セッション戦略
  // アダプタを使う場合（DBにセッションを保存する）
  session: {
    strategy: "jwt",
  },

  // コールバックを追加
  callbacks: {
    // JWTが作成・更新されるたびに呼ばれる
    async jwt({ token, user }) {
      // ログイン時 (userオブジェクトが存在する)
      if (user) {
        // token (JWTペイロード) にユーザーID (user.id) を 'sub' (Subject) として保存
        token.sub = user.id;
      }
      return token; // このペイロードが暗号化され、HttpOnlyクッキーに保存される
    },
    
    // クライアントがセッションを要求したとき (useSession) に呼ばれる
    async session({ session, token }) {
      // session.user オブジェクトに、JWTの 'sub' (ユーザーID) を 'id' として追加
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session; // この session オブジェクトがクライアントに返される
    },
  },
})

// GETリクエストとPOSTリクエストをNextAuthハンドラに渡す
export { handler as GET, handler as POST }