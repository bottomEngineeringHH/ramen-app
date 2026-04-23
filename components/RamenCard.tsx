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
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
      <h2>{review.store.name}</h2>
      {review.imageUrl && (
        <div style={{ margin: '10px 0' }}>
          <img
            src={review.imageUrl}
            alt="Ramen"
            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
          />
        </div>
      )}
      <p><strong>{LIST_PAGE.CREATE_DATE}</strong> {new Date(review.createdAt).toLocaleDateString()}</p>
      <p><strong>{LIST_PAGE.GENRE}</strong> {review.genre.name} | <strong>{LIST_PAGE.NOODLE}</strong> {review.noodle.name}</p>
      <p><strong>{LIST_PAGE.SCENE}</strong> {review.eatingScene.name}</p>
      <p><strong>{LIST_PAGE.COMMENT}</strong> {review.comment || LIST_PAGE.NO_COMMENT}</p>

      {/* --- 味変タイムライン UI --- */}
      <div style={{ margin: '25px 0 15px 0', padding: '15px 10px', backgroundColor: '#fafafa', border: '1px dashed #ccc', borderRadius: '8px' }}>
        <p style={{ fontSize: '0.9em', fontWeight: 'bold', margin: '0 0 25px 0', color: '#555' }}>
          {LIST_PAGE.FLAVOR_CHANGE_TIMELINE}
        </p>
        
        {/* タイムラインの土台（グレーのバー） */}
        <div style={{ position: 'relative', height: '6px', backgroundColor: '#e0e0e0', borderRadius: '3px', margin: '0 20px' }}>
          
          {/* 着丼と完食のラベル */}
          <span style={{ position: 'absolute', left: '-20px', top: '-6px', fontSize: '0.75em', color: '#888' }}>{LIST_PAGE.RAMEN_BOWL}</span>
          <span style={{ position: 'absolute', right: '-20px', top: '-6px', fontSize: '0.75em', color: '#888' }}>{LIST_PAGE.FINISH_EATING}</span>

          {/* 味変ピンの描画（パーセンテージに応じて配置） */}
          {review.ajihenEvents?.map((ajihen) => (
            <div 
              key={ajihen.id} 
              style={{ 
                position: 'absolute', 
                left: `${ajihen.percent}%`, // ここで横幅の位置を決定
                top: '-5px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                transform: 'translateX(-50%)' // ピンの真ん中が指定%になるようにズラす
              }}
            >
              {/* ピン本体の丸ポチ */}
              <div style={{ width: '14px', height: '14px', backgroundColor: '#e74c3c', borderRadius: '50%', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              
              {/* 調味料の名前（吹き出し風） */}
              <span style={{ marginTop: '6px', fontSize: '0.75em', backgroundColor: '#333', color: 'white', padding: '3px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                {ajihen.ingredient}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* --- タイムライン UI ここまで --- */}

      <div style={{ marginTop: '15px' }}>
        <a href={`/register?id=${review.id}`} style={{ marginRight: '10px', color: 'orange' }}>{LIST_PAGE.EDIT}</a>
        <button
          onClick={() => onDelete(review.id, review.store.name)}
          style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          {LIST_PAGE.DELETE}
        </button>
      </div>
    </div>
  );
}