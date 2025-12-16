import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // ファイルがなければエラー
  if (!filename || !request.body) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Vercel Blobに画像を保存
  const blob = await put(filename, request.body, {
    access: 'public',
  });

  // 保存した画像のURLを返す
  return NextResponse.json(blob);
}