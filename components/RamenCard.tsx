// components/RamenCard.tsx
import React from 'react';
import { RamenReviewWithRelations } from '@/components/types/ramen';
import { LIST_PAGE } from '../app/constants/caption_ja';

type RamenCardProps = {
  review: RamenReviewWithRelations;
  onDelete: (id: number, storeName: string) => void;
};

export default function RamenCard({ review, onDelete }: RamenCardProps) {

  return (
    <div className="bg-[#1A1A1A] border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
      {review.imageUrl && (
        <img
          src={review.imageUrl}
          alt="Ramen"
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">{review.store.name}</h2>

        <div className="space-y-2 text-slate-300 text-sm">
          <div className="flex justify-between">
            <span><strong>{LIST_PAGE.CREATE_DATE}</strong> {new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <p><strong>{LIST_PAGE.GENRE}</strong> {review.genre.name} | <strong>{LIST_PAGE.NOODLE}</strong> {review.noodle.name}</p>
          <p><strong>{LIST_PAGE.SCENE}</strong> {review.eatingScene.name}</p>
          <p className="text-left"><strong>{LIST_PAGE.COMMENT}</strong></p>
          <p className="text-slate-400 text-left ml-4">{review.comment || LIST_PAGE.NO_COMMENT}</p>
        </div>

        {/* --- 味変タイムライン UI --- */}
        {review.ajihenEvents && review.ajihenEvents.length > 0 && (
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mt-4">
            <p className="font-bold text-sm text-slate-300 mb-4">{LIST_PAGE.FLAVOR_CHANGE_TIMELINE}</p>

            {/* タイムラインの土台（グレーのバー） */}
            <div className="relative h-1.5 bg-slate-700 rounded-full mx-4 mb-4">

              {/* 着丼と完食のラベル */}
              <span className="absolute left-0 top-4 text-xs text-slate-400 -translate-x-1/2">{LIST_PAGE.RAMEN_BOWL}</span>
              <span className="absolute right-0 top-4 text-xs text-slate-400 translate-x-1/2">{LIST_PAGE.FINISH_EATING}</span>

              {/* 味変ピンの描画（パーセンテージに応じて配置） */}
              {review.ajihenEvents.map((ajihen) => (
                <div
                  key={ajihen.id}
                  className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `calc(${ajihen.percent}% + 1rem)` }}
                >
                  <div className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-md" />
                  <span className="mt-2 text-xs bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap">
                    {ajihen.ingredient}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* --- タイムライン UI ここまで --- */}

        <div className="flex gap-4 border-t border-slate-700 pt-4">
          <a href={`/register?id=${review.id}`} className="text-orange-500 hover:text-orange-400 transition underline text-sm">{LIST_PAGE.EDIT}</a>
          <button
            onClick={() => onDelete(review.id, review.store.name)}
            className="text-red-500 hover:text-red-400 transition border-none bg-none cursor-pointer text-sm"
          >
            {LIST_PAGE.DELETE}
          </button>
        </div>
      </div>
    </div>
  );
}