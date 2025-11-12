// app/AuthProvider.tsx

'use client' // クライアントコンポーネントとして定義
import { SessionProvider } from 'next-auth/react'
import React from 'react'

// SessionProviderをラップするコンポーネント
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // アプリ全体をSessionProviderでラップする
  return <SessionProvider>{children}</SessionProvider>
}