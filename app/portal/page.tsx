'use client';
import { useEffect } from 'react';
import useSWR from 'swr';
import { io } from 'socket.io-client';
import { MESSAGES } from '../constants/messages_ja';
import { TIMELINE_PAGE } from '../constants/caption_ja';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// データを取得するためのおまじない
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TimelinePage() {
  const { data: session } = useSession();
  // 本来はNextAuth等から取得しますが、今はテスト用に仮のユーザーIDを定義しておきます
  const currentUserId = session?.user?.id;

  // SWRでバックエンドから最新のタイムライン（20件）を取得
  const { data: reviews, error, mutate } = useSWR('http://localhost:3001/ramen/timeline', fetcher);

  // WebSocketsの電波塔（誰かがアクションした瞬間に最新化する仕組み）
  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('timelineUpdated', () => {
      console.log('バックエンドから更新通知を受信！');
      mutate(); // 画面の裏側でこっそり最新データを再取得して書き換える
    });
    return () => {
      socket.disconnect(); // 画面を離れる時に接続を切る
    };
  }, [mutate]);

  // リアクションボタン（🔥 🧄 🍜）を押した時の処理
  const handleReact = async (reviewId: number, type: string) => {
    // 未ログイン時のガード処理
    if (!currentUserId) {
      alert(MESSAGES.I_DO_LOGIN);
      return;
    }

    await fetch(`http://localhost:3001/ramen/${reviewId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, type }),
    });
    // クリックした瞬間にも画面を更新（レスポンスを良くするため）
    mutate();
  };

  // 読み込み中・エラー時の表示
  if (error) return <div className="text-center text-red-500 py-10">{MESSAGES.E_LOAD_DATA}</div>;
  if (!reviews) return <div className="text-center text-xl font-bold py-20 animate-pulse">{MESSAGES.L_LOADING_MESHITERO}</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-orange-500 border-b border-slate-700 pb-4">
          {TIMELINE_PAGE.NEW_MESHITERO}
        </h1>
        <Link href="/list" className="text-sm text-slate-300 hover:text-white transition underline">
            {TIMELINE_PAGE.BACK_TO_LIST}
        </Link>

        {/* 取得したレビューの数だけカードを繰り返し表示 */}
        <div className="space-y-8">
          {reviews.map((review: any) => {
            // このレビューに対する各リアクションの数を数える
            const fireCount = review.reactions?.filter((r: any) => r.type === 'FIRE').length || 0;
            const garlicCount = review.reactions?.filter((r: any) => r.type === 'GARLIC').length || 0;
            const tomorrowCount = review.reactions?.filter((r: any) => r.type === 'TOMORROW').length || 0;

            return (
              <div key={review.id} className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 transition-transform hover:-translate-y-1">
                
                {/* ラーメン画像（画像がない場合はグレーのプレースホルダー） */}
                {review.imageUrl ? (
                  <img src={review.imageUrl} alt={review.store?.name} className="w-full h-64 object-cover" />
                ) : (
                  <div className="w-full h-64 bg-slate-700 flex items-center justify-center text-slate-500">
                    {TIMELINE_PAGE.NO_IMAGE}
                  </div>
                )}

                <div className="p-6">
                  {/* 店名とジャンル */}
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-white">{review.store?.name || TIMELINE_PAGE.UNKNOWN_STORE_NAME}</h2>
                    <span className="bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      {review.genre?.name || TIMELINE_PAGE.UNKNOWN_GENRE}
                    </span>
                  </div>

                  {/* コメント */}
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {review.comment || TIMELINE_PAGE.NO_COMMENT}
                  </p>

                  {/* 🔥 ここが肝！ 味変イベントのハイライト 🔥 */}
                  {review.ajihenEvents && review.ajihenEvents.length > 0 && (
                    <div className="bg-slate-900 p-4 rounded-lg mb-6 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2 font-bold">{TIMELINE_PAGE.AJIHEN_TIMELINE}</p>
                      <div className="flex flex-wrap gap-2">
                        {review.ajihenEvents.map((ajihen: any) => (
                          <span key={ajihen.id} className="text-sm bg-slate-700 px-2 py-1 rounded text-orange-300">
                            {TIMELINE_PAGE.REMAINING} {ajihen.percent}% ➔ {ajihen.ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* リアクションボタン群 */}
                  <div className="flex gap-4 border-t border-slate-700 pt-4">
                    <button 
                      onClick={() => handleReact(review.id, 'FIRE')} 
                      className="flex-1 flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 py-2 rounded-xl transition"
                    >
                      🔥 <span className="font-bold">{fireCount > 0 ? fireCount : TIMELINE_PAGE.LOOKS_DELICIOUS}</span>
                    </button>
                    <button 
                      onClick={() => handleReact(review.id, 'GARLIC')} 
                      className="flex-1 flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 py-2 rounded-xl transition"
                    >
                      🧄 <span className="font-bold">{garlicCount > 0 ? garlicCount : TIMELINE_PAGE.GARLIC}</span>
                    </button>
                    <button 
                      onClick={() => handleReact(review.id, 'TOMORROW')} 
                      className="flex-1 flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 py-2 rounded-xl transition"
                    >
                      🍜 <span className="font-bold">{tomorrowCount > 0 ? tomorrowCount : TIMELINE_PAGE.GOING_TOMORROW}</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* レビューが1件もない場合 */}
        {reviews.length === 0 && (
          <div className="text-center text-slate-400 py-20">
            {TIMELINE_PAGE.ENTER_THE_RAMWN}
          </div>
        )}

      </div>
    </div>
  );
}