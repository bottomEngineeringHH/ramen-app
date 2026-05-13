// app/dashboard/page.tsx
'use client';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import Link from 'next/link';
import { MESSAGES } from '../constants/messages_ja';
import { DASHBOARD_PAGE } from '../constants/caption_ja';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: user, error } = useSWR(
    userId ? `http://localhost:3001/ramen/dashboard/${userId}` : null,
    fetcher
  );

  if (!userId) return <div className="p-4 text-white">{MESSAGES.E_NOT_AUTHENTICATED}</div>;
  if (error) return <div className="p-4 text-white">エラーが発生しました</div>;
  if (!user) return <div className="p-4 text-white flex items-center justify-center min-h-screen">{MESSAGES.L_LOADING_DASHBOARD}</div>;

  // データの自動計算
  console.log('ユーザーデータ:', user); // デバッグ用ログ
  const totalBowls = user.reviews.length;
  const uniqueStores = new Set(user.reviews.filter((r: any) => r.storeId).map((r: any) => r.storeId)).size;
  
  // ジャンル別の集計
  const genreCounts: Record<string, number> = {};
  user.reviews.forEach((r: any) => {
    const genre = r.genre?.name || 'その他';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });
  
  // 割合順にソート
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ヘッダー */}
        <div className="flex justify-between items-end border-b-2 border-orange-500 pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{DASHBOARD_PAGE.TITLE}</h1>
            <p className="text-slate-400 mt-2 tracking-widest text-sm">{DASHBOARD_PAGE.DESCRIPTION}</p>
          </div>
          <Link href="/timeline" className="text-slate-400 hover:text-white transition underline">
            {DASHBOARD_PAGE.BACK_TO_TIMELINE}
          </Link>
        </div>

        {/* 上段：KPIメトリクス */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1A1A1A] border border-slate-700 rounded-2xl p-8 flex items-center justify-between">
            <div>
              <p className="text-slate-400 uppercase tracking-widest text-sm mb-1">{DASHBOARD_PAGE.LIFETIME_BOWLS}</p>
              <h2 className="text-5xl font-bold text-orange-500">{totalBowls} <span className="text-2xl text-white">{DASHBOARD_PAGE.CUP}</span></h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 uppercase tracking-widest text-sm mb-1">{DASHBOARD_PAGE.CONQUERED_STORES}</p>
              <h2 className="text-5xl font-bold text-orange-500">{uniqueStores} <span className="text-2xl text-white">{DASHBOARD_PAGE.STORE}</span></h2>
            </div>
          </div>

          {/* ジャンル分布 */}
          <div className="bg-[#1A1A1A] border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-orange-500 mb-4 border-b border-slate-700 pb-2">Flavor Profile</h3>
            <div className="space-y-4">
              {sortedGenres.map(([genre, count]) => {
                const percentage = totalBowls > 0 ? Math.round((count / totalBowls) * 100) : 0;
                return (
                  <div key={genre} className="flex items-center gap-4">
                    <span className="w-24 text-right text-sm text-slate-300 font-bold">{genre}</span>
                    <div className="grow h-4 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-linear-to-r from-orange-600 to-orange-400" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="w-12 text-right text-sm font-bold">{percentage}%</span>
                  </div>
                );
              })}
              {sortedGenres.length === 0 && <p className="text-slate-500">{DASHBOARD_PAGE.NO_DATA}</p>}
            </div>
          </div>
        </div>

        {/* 下段：称号＆直近のレビュー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 称号一覧 */}
          <div className="bg-[#1A1A1A] border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-orange-500 mb-4 border-b border-slate-700 pb-2">{DASHBOARD_PAGE.BADGE_STATUS}</h3>
            <div className="grid grid-cols-2 gap-4">
              {user.badges.map((b: any) => (
                <div key={b.badge.id} className="bg-slate-800/50 border border-slate-600 rounded-xl p-4 flex items-center gap-3" title={b.badge.description}>
                  <span className="text-3xl">{b.badge.icon}</span>
                  <span className="font-bold text-sm">{b.badge.name}</span>
                </div>
              ))}
              {user.badges.length === 0 && <p className="text-slate-500 col-span-2">{DASHBOARD_PAGE.ENTRY_REVIEW}</p>}
            </div>
          </div>

          {/* 直近のレビュー */}
          <div className="bg-[#1A1A1A] border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-orange-500 mb-4 border-b border-slate-700 pb-2">{DASHBOARD_PAGE.RECENT_CONQUERED}</h3>
            <ul className="space-y-3">
              {user.reviews.slice(0, 5).map((r: any) => (
                <li key={r.id} className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                  <span className="font-bold">{r.store?.name || '不明な店舗'}</span>
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">{r.genre?.name || '不明'}</span>
                </li>
              ))}
              {user.reviews.length === 0 && <p className="text-slate-500">{DASHBOARD_PAGE.NO_DATA}</p>}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}