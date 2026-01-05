// components/types/ramen.ts

// サーバーから受け取るラーメンレビューの完全なデータ構造
export type RamenReviewWithRelations = {
  id: number;
  comment: string | null;
  vibe: number | null;
  imageUrl: string | null;
  createdAt: string;
  
  // 関連データ（NestJSでincludeした部分）
  store: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  };
  genre: {
    id: number;
    name: string;
  };
  noodle: {
    id: number;
    name: string;
  };
  eatingScene: {
    id: number;
    name: string;
  };
};

// バックエンドのCreateRamenDtoと同期させるフォームのデータ構造
export type RamenFormData = {
  storeName: string;
  latitude: number;
  longitude: number;
  genreId: number;
  noodleId: number;
  eatingSceneId: number;
  
  comment?: string;
  vibe?: number;
};

// バリデーションエラーの型定義
export type FormErrors = {
  [K in keyof RamenFormData]?: string; 
};

// フォームの初期値を作成するための型ヘルパー
// Reviewデータを受け取り、RamenFormData型を返す関数を定義
export const reviewToFormData = (review: RamenReviewWithRelations): RamenFormData => ({
    storeName: review.store.name,
    latitude: review.store.latitude,
    longitude: review.store.longitude,
    genreId: review.genre.id,
    noodleId: review.noodle.id,
    eatingSceneId: review.eatingScene.id,
    comment: review.comment || '',
    vibe: review.vibe || 0,
});