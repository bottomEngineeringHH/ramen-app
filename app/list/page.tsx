// app/list/page.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RamenReviewWithRelations } from '@/components/types/ramen'; // RamenReviewWithRelationsをインポート
import { MESSAGES } from '../constants/messages_ja';
import { LIST_PAGE } from '../constants/caption_ja';
import LoginButton from '@/components/LoginButton';
import RamenCard from '@/components/RamenCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/ramen';

export default function RamenListPage() {
  const [reviews, setReviews] = useState<RamenReviewWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(0);

  // データ絞り込み処理
  const filteredReviews = useMemo(() => {
    // まだデータがない場合は空配列を返す
    if (!reviews) return [];

    return reviews.filter((review) => {
      // 店名かコメントに検索文字が含まれているか
      const matchText = 
        review.store.name.includes(searchTerm) || 
        (review.comment && review.comment.includes(searchTerm));
      
      // ジャンルが「すべて(0)」か、選んだジャンルと一致するか
      const matchGenre = 
        selectedGenre === 0 || review.genre.id === selectedGenre;

      return matchText && matchGenre;
    });
  }, [reviews, searchTerm, selectedGenre]);

  // データの取得ロジック (再利用しやすいように関数化)
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(MESSAGES.E_LOAD_LIST);
      }
      const data: RamenReviewWithRelations[] = await response.json();
      setReviews(data);
    } catch (e: unknown) {
      // TODO:エラー内容に応じて出力するメッセージを変更する
      console.error("Fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: number, storeName: string) => {
    // ユーザーに確認
    if (!window.confirm(MESSAGES.C_DELETE_CONFIRM(storeName))) {
      return;
    }

    try {
      // Next.jsサーバーから生のJWTを取得
      const tokenRes = await fetch('/api/get-token');
      if (!tokenRes.ok) {
        // ログインしていない、またはトークン取得に失敗
        alert(MESSAGES.E_NOT_AUTHENTICATED);
        return;
      }
      const { token } = await tokenRes.json();

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE', // DELETEメソッドでバックエンドのAPIを呼び出す
        headers: {
          'Authorization': `Bearer ${token}`, // 認証ヘッダー
        },
      });

      if (response.ok) {
        alert(MESSAGES.S_DELETE_SUCCESS(storeName));
        // データを再取得してリストを更新（削除したアイテムを画面から消す）
        fetchReviews();
      } else {
        // サーバーからのエラー詳細を取得
        const errorData = await response.json();
        console.error("Server Error Data:", errorData.message);

        if (response.status === 400) {
          // バリデーションエラー等
          alert(MESSAGES.E_400_BAD_REQUEST);
        } else if (response.status === 404) {
          // 存在しないIDを削除
          alert(MESSAGES.E_404_NOT_FOUND);
        } else {
          // 500番台のエラー
          alert(MESSAGES.E_500_SERVER_ERROR);
        }
      }
    } catch (error: unknown) {
      // TODO:エラー内容に応じて出力するメッセージを変更する
      console.error("Delete error:", error);
    }
  };

  // ロード中の表示
  if (isLoading) {
    return <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="text-white text-xl animate-pulse">{MESSAGES.L_LOADING_LIST}</div></main>;
  }

  // エラー時の表示
  if (error) {
    return <main className="min-h-screen bg-[#0A0A0A] text-red-400 p-6 flex items-center justify-center"><div>{error}</div></main>;
  }

  // 登録データがない場合の表示
  if (reviews.length === 0) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10">
        <div className="w-full max-w-2xl mx-auto text-center">
          <LoginButton />
          <p className="text-slate-400 mt-6">{MESSAGES.E_NO_ENTRY}</p>
          <a
            href="/register"
            className="inline-block mt-4 text-orange-500 hover:text-orange-400 transition underline"
          >
            {LIST_PAGE.CREATE_NEW}
          </a>
        </div>
      </main>
    );
  }

  // --- レビューリストのレンダリング ---
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <LoginButton />
        </div>

        <div className="text-center border-b-2 border-orange-500 pb-4 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">{MESSAGES.TITLE_LIST(reviews.length)}</h1>
          <p className="text-slate-400 mt-2 text-sm">{reviews.length}件のラーメンレビュー</p>
          <a href="/register" className="inline-block mt-4 text-orange-500 hover:text-orange-400 transition underline">{LIST_PAGE.CREATE_NEW}</a>
        </div>

        <div className="mb-8 flex flex-col gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <input
            type="text"
            placeholder="店名やコメントで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
          />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(Number(e.target.value))}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          >
            <option value={0}>{LIST_PAGE.ALL_GENRE}</option>
            {Array.from(new Map(reviews.map(r => [r.genre.id, r.genre])).values()).map((genre) => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <RamenCard
              key={review.id}
              review={review}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </main>
  );
}