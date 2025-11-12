// components/types/master.ts
// 汎用的なマスタデータの型
export type MasterItem = {
  id: number;
  name: string;
};

// APIレスポンス全体のマスタデータ構造
export type RamenMasters = {
  genres: MasterItem[];       // ジャンルマスタ
  noodleTypes: MasterItem[];  // 麺の種類マスタ
  eatingScenes: MasterItem[]; // 食べるシーンマスタ
};