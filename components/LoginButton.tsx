// components/LoginButton.tsx

'use client' // 状態を扱うためクライアントコンポーネント

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image' // Next.jsの画像最適化コンポーネント

export default function LoginButton() {
  // useSessionフックでログインセッションと状態を取得
  const { data: session, status } = useSession()

  // ロード中の表示
  if (status === 'loading') {
    return <div style={{ padding: '10px' }}>読み込み中...</div>
  }

  // ログイン中の表示
  if (session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
        {/* ユーザー画像があれば表示 */}
        {session.user?.image && (
          <Image 
            src={session.user.image} 
            alt={session.user.name ?? "アバター"}
            width={40} 
            height={40} 
            style={{ borderRadius: '50%' }}
          />
        )}
        <span>{session.user?.name} さん</span>
        {/* ログアウトボタン */}
        <button onClick={() => signOut()}>ログアウト</button>
      </div>
    )
  }

  // 未ログイン時の表示
  return (
    <div style={{ padding: '10px' }}>
      <span>ログインしていません</span>
      {/* ログインボタン (GitHubプロバイダーを指定) */}
      <button onClick={() => signIn('github')}>GitHubでログイン</button>
    </div>
  )
}