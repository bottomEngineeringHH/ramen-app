// constants/messages.ts

export const MESSAGES = {
  // --- 画面タイトル ---
  TITLE_REGISTER: '🍜 新しいラーメンを登録',
  TITLE_EDIT: (id: string | number) => `🍜 ラーメン情報を編集 (ID: ${id})`,
  TITLE_LIST: (count: number) => `🍜 ラーメン登録履歴 (${count} 件)`,

  // --- 成功メッセージ ---
  S_REGISTER_SUCCESS: '🍜 ラーメン情報が正常に登録されました！',
  S_UPDATE_SUCCESS: '🍜 ラーメン情報が正常に更新されました！',
  S_DELETE_SUCCESS: (storeName: string) => `${storeName} のレビューを削除しました。`,
  
  // --- 確認メッセージ ---
  C_DELETE_CONFIRM: (storeName: string) => `【${storeName}】のレビューを削除してもよろしいですか？\nこの操作は元に戻せません。`,

  // --- 情報メッセージ ---
  // 一覧画面
  I_NO_DATA: 'ラーメン情報が登録されていません。',

  // --- エラーメッセージ ---
  // 共通
  E_VALIDATION: '未入力の必須項目があります。赤背景の箇所を確認してください。',
  E_NETWORK: 'ネットワークエラーが発生しました。サーバーが起動しているか確認してください。',
  E_SERVER_ERROR: (message: string) => `登録エラー: ${message || 'サーバーエラーが発生しました'}`,
  E_LOAD_MASTERS: 'エラー: マスタデータの読み込みに失敗しました。',
  E_LOAD_REVIEW: 'エラー: レビューデータの取得に失敗',
  E_LOAD_DATA: 'エラー: データロードに失敗しました。',
  E_DELETE_GENERIC: '削除エラー: サーバーエラーが発生しました',
  E_400_BAD_REQUEST: '入力内容が不正です。',
  E_404_NOT_FOUND: '指定されたリソースが見つかりませんでした。',
  E_500_SERVER_ERROR: 'サーバー側で問題が発生しました。時間をおいて再試行してください。',
  E_NOT_AUTHENTICATED: '認証されていません。ログインしてください。',
  // TODO:〇〇が不正です。でパラメータを与えたら置換できるようにする。
  E_INVALID_REVIEW_ID: 'レビューIDが不正です。',
  // 一覧画面
  E_LOAD_LIST: 'ラーメン一覧の取得に失敗しました。',
  // 登録(編集)画面
  E_REQUIRED_STORENAME: '店名は必須です。',
  E_REQUIRED_STATION: '最寄り駅の入力は必須です。',
  E_REQUIRED_GENRE: 'ジャンルを選択してださい。',
  E_REQUIRED_NOODLE_TYPE: '麺の種類を選択してください。',
  E_REQUIRED_EATING_SCENE: '食べるシーンを選択してください。',
  E_INCLUDE_INAPPROPRIATE_COMMENT: 'コメントに不適切な表現が含まれています。',

  // --- ローディング ---
  L_LOADING_MASTERS: 'マスタデータを読み込み中...',
  L_LOADING_EDIT: '編集データをロード中...',
  L_LOADING_LIST: 'ラーメン情報を読み込み中...',
  L_LOADING_FORM: 'フォームを準備中...',
};