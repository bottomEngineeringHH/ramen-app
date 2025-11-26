// app/list/page.tsx (最終版)

'use client';

import React, { useState, useEffect } from 'react';
import { RamenReviewWithRelations } from '@/components/types/ramen'; // RamenReviewWithRelationsをインポート
import { MESSAGES } from '../constants/messages_ja';
import { LIST_PAGE } from '../constants/caption_ja';
import LoginButton from '@/components/LoginButton';

const API_BASE_URL = 'http://localhost:3001/ramen';

export default function RamenListPage() {
  const [reviews, setReviews] = useState<RamenReviewWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

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
    return <main style={{ padding: '20px' }}>{MESSAGES.L_LOADING_LIST}</main>;
  }

  // エラー時の表示
  if (error) {
    return <main style={{ padding: '20px', color: 'red' }}>{error}</main>;
  }

  // 登録データがない場合の表示
  if (reviews.length === 0) {
    return (
      <main style={{ padding: '20px' }}>
        <LoginButton />
        <p>まだラーメン情報が登録されていません。</p>
        <a 
          href="/register" 
          style={{ 
            color: '#3498db', 
            textDecoration: 'underline', 
            marginLeft: '10px' 
          }}
        >
          {LIST_PAGE.CREATE_NEW}
        </a>
      </main>
    );
  }

  // --- レビューリストのレンダリング ---
  return (
    <main style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <LoginButton />

      <h1>{MESSAGES.TITLE_LIST(reviews.length)}</h1>
      <a href="/register" style={{ display: 'block', marginBottom: '20px', color: '#3498db' }}>{LIST_PAGE.CREATE_NEW}</a>

      <div style={{ display: 'grid', gap: '20px' }}>
        {reviews.map((review) => (
          <div
            key={review.id}
            style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}
          >
            <h2>{review.store.name}</h2>
            <p><strong>{LIST_PAGE.CREATE_DATE}</strong> {new Date(review.createdAt).toLocaleDateString()}</p>
            <p><strong>{LIST_PAGE.GENRE}</strong> {review.genre.name} | <strong>{LIST_PAGE.NOODLE}</strong> {review.noodle.name}</p>
            <p><strong>{LIST_PAGE.SCENE}</strong> {review.eatingScene.name}</p>
            <p><strong>{LIST_PAGE.COMMENT}</strong> {review.comment || LIST_PAGE.NO_COMMENT}</p>
            <p>
              {/* 編集リンク */}
              <a href={`/register?id=${review.id}`} style={{ marginRight: '10px', color: 'orange' }}>{LIST_PAGE.EDIT}</a>

              {/* 削除ボタンの onClick ハンドラを設定 */}
              <button
                onClick={() => handleDelete(review.id, review.store.name)}
                style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
              >{LIST_PAGE.DELETE}</button>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}