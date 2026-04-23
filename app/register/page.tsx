// app/register/page.tsx

'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // URLパラメータ取得用
import { RamenFormData, FormErrors, RamenReviewWithRelations, reviewToFormData } from '@/components/types/ramen';
import { RamenMasters, MasterItem } from '@/components/types/master';
import Link from 'next/link';
import { MESSAGES } from '../constants/messages_ja';
import { REGISTER_FORM, LIST_PAGE } from '../constants/caption_ja';
import { signIn } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/ramen';

function RegisterContent() {
  const searchParams = useSearchParams(); // URLのクエリパラメータを取得
  const reviewId = searchParams.get('id'); // URLから 'id' パラメータを取得 (編集モードならIDが入る)
  const isEditMode = !!reviewId; // IDがあれば編集モード

  // フォームの状態管理
  const [formData, setFormData] = useState<RamenFormData>({
    storeName: '', latitude: 0, longitude: 0, genreId: 0, noodleId: 0, eatingSceneId: 0, comment: '', vibe: 0,
  });

  // エラーの状態管理
  const [errors, setErrors] = useState<FormErrors>({});
  // マスタデータ（プルダウン用）の状態管理
  const [masters, setMasters] = useState<RamenMasters | null>(null);
  // フォーム送信成功メッセージ
  const [message, setMessage] = useState('');
  // フォームのロード状態
  const [isLoading, setIsLoading] = useState(false);

  // 画像ファイルを保持するstateを追加
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 味変リストのStateと操作関数 ---
  const [ajihenList, setAjihenList] = useState<{ percent: number; ingredient: string }[]>([]);

  // 新しい味変入力欄を追加する（初期値は50%）
  const addAjihen = () => {
    setAjihenList([...ajihenList, { percent: 50, ingredient: '' }]);
  };
  
  // スライダーやテキストボックスの値が変わった時にStateを更新する
  const updateAjihen = (index: number, field: 'percent' | 'ingredient', value: number | string) => {
    const newList = [...ajihenList];
    // @ts-ignore (型の簡易化のため)
    newList[index][field] = value;
    setAjihenList(newList);
  };

  // ゴミ箱ボタンで味変入力欄を削除する
  const removeAjihen = (index: number) => {
    setAjihenList(ajihenList.filter((_, i) => i !== index));
  };

  // --- 1. マスタデータ & 既存レビューデータの取得 ---
  useEffect(() => {
    setIsLoading(true);
    const idToFetch = reviewId;

    async function fetchData() {
      try {
        // マスタデータ取得
        const mastersResponse = await fetch(`${API_BASE_URL}/masters`);
        const mastersData: RamenMasters = await mastersResponse.json();
        setMasters(mastersData);

        // 編集モードの場合、レビューデータを取得しフォームに反映
        if (isEditMode && idToFetch) {
          const reviewResponse = await fetch(`${API_BASE_URL}/${idToFetch}`);
          if (!reviewResponse.ok) throw new Error(MESSAGES.E_LOAD_REVIEW);

          const reviewData: RamenReviewWithRelations = await reviewResponse.json();
          // 取得したデータをフォームの型に変換し、フォームの状態にセット
          setFormData(reviewToFormData(reviewData));

          // 味変イベントもフォームに反映
          if (reviewData.ajihenEvents && reviewData.ajihenEvents.length > 0) {
            const formattedAjihen = reviewData.ajihenEvents.map((a: any) => ({
              percent: a.percent,
              ingredient: a.ingredient
            }));
            setAjihenList(formattedAjihen);
          } else {
            // 編集モードでも味変データがない場合は空に戻す（前のデータが残るのを防ぐ）
            setAjihenList([]); 
          }
        }
      } catch (error: unknown) {
        console.error("Data fetch error:", error);
        setMessage(MESSAGES.E_LOAD_DATA + ` ${error}`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [isEditMode, reviewId]); // 依存配列: 編集モードとIDが変わったら再実行

  // --- 2. バリデーション処理 ---
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 1. 店名チェック
    if (!formData.storeName) {
      newErrors.storeName = MESSAGES.E_REQUIRED_STORENAME;
      isValid = false;
    }

    // 緯度経度チェックは一旦コメントアウト（Geocoding APIを無効化したため）
    // if (formData.latitude === 0 || formData.longitude === 0) {
    //     newErrors.latitude = '場所の検索・確定は必須です。';
    //     newErrors.longitude = '場所の検索・確定は必須です。';
    //     isValid = false;
    // }

    // 3. マスタIDチェック (IDが0、つまり初期値の「選択してください」のままかチェック)
    if (formData.genreId === 0) {
      newErrors.genreId = MESSAGES.E_REQUIRED_GENRE;
      isValid = false;
    }
    if (formData.noodleId === 0) {
      newErrors.noodleId = MESSAGES.E_REQUIRED_NOODLE_TYPE;
      isValid = false;
    }
    if (formData.eatingSceneId === 0) {
      newErrors.eatingSceneId = MESSAGES.E_REQUIRED_EATING_SCENE;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  // --- 3. フォーム送信処理 (POSTとPATCHを切り替える) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // 緯度経度を手動で設定（Geocoding APIを使わないため）
    let currentFormData = formData;
    if (currentFormData.latitude === 0) {
      currentFormData = {
        ...currentFormData,
        latitude: 35.6895,
        longitude: 139.6917
      };
      // フォームの状態も更新
      setFormData(currentFormData);
    }

    if (!validate()) {
      setMessage(MESSAGES.E_VALIDATION);
      return;
    }

    try {
      let imageUrl = ''; // 画像がない場合は空文字（または既存のURL）

      // ★ 画像があれば、まずNext.jsのAPI経由でVercel Blobにアップロード
      if (file) {
        const uploadRes = await fetch(`/api/upload?filename=${file.name}`, {
          method: 'POST',
          body: file,
        });
        const newBlob = await uploadRes.json();
        imageUrl = newBlob.url; // 画像のURLゲット！
      }
      // まずNext.jsサーバーから生のJWTを取得
      const tokenRes = await fetch('/api/get-token');
      if (!tokenRes.ok) {
        alert(MESSAGES.E_NOT_AUTHENTICATED);

        // GitHubのログインページにリダイレクトさせる
        // ログイン成功後、自動でこの登録ページに戻ってくる
        await signIn('github', { callbackUrl: window.location.href });
        return;
      }
      const { token } = await tokenRes.json();

      // 送信メソッドとURLをモードによって切り替える
      const method = isEditMode ? 'PATCH' : 'POST';
      const url = isEditMode ? `${API_BASE_URL}/${reviewId}` : API_BASE_URL;

      const submitData = {
        ...currentFormData,
        imageUrl: imageUrl ? [imageUrl] : [], // 配列で渡す設計の場合
        ajihenEvents: ajihenList.filter(a => a.ingredient.trim() !== ''),
      };
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        // 送信データは最新のcurrentFormDataを使う
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setMessage(isEditMode ? MESSAGES.S_UPDATE_SUCCESS : MESSAGES.S_REGISTER_SUCCESS);
        // TODO:登録・更新後は一覧画面などに遷移するの良いか検討
      } else {
        const errorData = await response.json();
        setMessage(MESSAGES.E_SERVER_ERROR(errorData.message));
      }
    } catch (error) {
      console.error("API call error:", error);
      setMessage(MESSAGES.E_NETWORK);
    }
  };

  // フォームの入力変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // 数値型プロパティ（IDなど）は整数に変換
      [name]: name.endsWith('Id') || name === 'vibe' ? parseInt(value) || 0 : value,
    }));
  };

  // データの読み込み待ち
  if (isLoading || !masters) {
    return <main style={{ textAlign: 'center', padding: '50px' }}>{isEditMode ? MESSAGES.L_LOADING_EDIT : MESSAGES.L_LOADING_FORM}</main>;
  }

  // --- 4. フォームのレンダリング ---
  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/list" style={{ color: '#3498db', textDecoration: 'none' }}>
          {LIST_PAGE.BACK_TO_LIST}
        </Link>
      </div>

      <h1>{isEditMode ? MESSAGES.TITLE_EDIT(reviewId!) : MESSAGES.TITLE_REGISTER}</h1>

      {message && <div style={{ color: message.startsWith(REGISTER_FORM.ERROR) ? 'red' : 'green', marginBottom: '15px' }}>{message}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>

        {/* --- 1. 店名 --- */}
        <div>
          <label htmlFor="storeName">{REGISTER_FORM.STORE_NAME}</label>
          <input
            id="storeName"
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            style={{ borderColor: errors.storeName ? 'red' : 'gray' }}
          />
          {errors.storeName && <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.storeName}</p>}
          <p style={{ marginTop: '5px', fontSize: '0.9em', color: 'green' }}>
            {REGISTER_FORM.LOCATION_CONFIRMED}
          </p>
        </div>

        {/* --- 2. 場所 (緯度経度は固定値を使用) --- */}
        <div>
          <label htmlFor="location">{REGISTER_FORM.STATION}</label>
          <input
            id="location"
            type="text"
            name="nearestStation" // 新しい name 属性 (formDataにはないが、将来的に追加)
            onChange={handleChange}
            placeholder={REGISTER_FORM.STATION_PLACEHOLDER}
            style={{
              borderColor: errors.latitude ? 'red' : 'gray' // エラーチェックはそのまま
            }}
          />
          {/* 緯度経度が設定されたか否かのメッセージ */}
          <p style={{ marginTop: '5px', fontSize: '0.9em', color: 'green' }}>
            {REGISTER_FORM.LOCATION_CONFIRMED}
          </p>
          {/* 緯度経度チェックのメッセージを再利用 */}
          {(errors.latitude) && <p style={{ color: 'red', margin: '5px 0 0' }}>{MESSAGES.E_REQUIRED_STATION}</p>}
        </div>

        {/* --- 3. ジャンル (マスタデータ利用) --- */}
        <div>
          <label htmlFor="genreId">{REGISTER_FORM.GENRE}</label>
          <select
            id="genreId"
            name="genreId"
            value={formData.genreId}
            onChange={handleChange}
            style={{ borderColor: errors.genreId ? 'red' : 'gray' }}
          >
            <option value={0}>{REGISTER_FORM.SELECT_PLACEHOLDER}</option>
            {masters?.genres?.map((item: MasterItem) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.genreId && <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.genreId}</p>}
        </div>

        {/* --- 4. 麺の種類 --- */}
        <div>
          <label htmlFor="noodleId">{REGISTER_FORM.NOODLE}</label>
          <select
            id="noodleId"
            name="noodleId"
            value={formData.noodleId}
            onChange={handleChange}
            style={{ borderColor: errors.noodleId ? 'red' : 'gray' }}
          >
            <option value={0}>{REGISTER_FORM.SELECT_PLACEHOLDER}</option>
            {masters?.noodleTypes?.map((item: MasterItem) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.noodleId && <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.noodleId}</p>}
        </div>

        {/* --- 5. オススメの食べるシーン --- */}
        <div>
          <label htmlFor="eatingSceneId">{REGISTER_FORM.SCENE}</label>
          <select
            id="eatingSceneId"
            name="eatingSceneId"
            value={formData.eatingSceneId}
            onChange={handleChange}
            style={{ borderColor: errors.eatingSceneId ? 'red' : 'gray' }}
          >
            <option value={0}>{REGISTER_FORM.SELECT_PLACEHOLDER}</option>
            {masters?.eatingScenes?.map((item: MasterItem) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.eatingSceneId && <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.eatingSceneId}</p>}
        </div>

        {/* --- 6. 雰囲気 (ラジオボタン: 任意) --- */}
        <div>
          <label>{REGISTER_FORM.VIBE}</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
            <label>
              <input
                type="radio"
                name="vibe"
                value={1}
                checked={formData.vibe === 1}
                onChange={handleChange}
              />
              {REGISTER_FORM.VIBE_GOOD}
            </label>
            <label>
              <input
                type="radio"
                name="vibe"
                value={2}
                checked={formData.vibe === 2}
                onChange={handleChange}
              />
              {REGISTER_FORM.VIBE_NORMAL}
            </label>
            <label>
              <input
                type="radio"
                name="vibe"
                value={3}
                checked={formData.vibe === 3}
                onChange={handleChange}
              />
              {REGISTER_FORM.VIBE_DEEP}
            </label>
          </div>
        </div>

        {/* --- 画像アップロード --- */}
        <div style={{ marginBottom: '15px' }}>
          <label>{REGISTER_FORM.PHOTO}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                setFile(selectedFile);
                setPreviewUrl(URL.createObjectURL(selectedFile));
              }
            }}
          />
          {/* プレビュー表示 */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: '100px', marginTop: '10px', borderRadius: '8px' }}
            />
          )}
        </div>

        {/* --- 7. フリーコメント --- */}
        <div>
          <label htmlFor="comment">{REGISTER_FORM.COMMENT}</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows={4}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* --- 8.味変タイムライン入力エリア --- */}
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: '#fafafa' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1em' }}>{REGISTER_FORM.FLAVOR_CHANGE_TIMELINE}</h3>
          
          {ajihenList.map((ajihen, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>
              
              {/* スライダー（0〜100） */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8em', color: '#666' }}>{REGISTER_FORM.INJECTION_TIMING} {ajihen.percent}% ({REGISTER_FORM.ARRIVED_RAMEN} 0% 〜 {REGISTER_FORM.FINISH_EATING} 100%)</label>
                <input 
                  type="range" 
                  min="0" max="100" step="5"
                  value={ajihen.percent}
                  onChange={(e) => updateAjihen(index, 'percent', Number(e.target.value))}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* 調味料の名前入力 */}
              <input 
                type="text" 
                placeholder={REGISTER_FORM.INGREDIENT_PLACEHOLDER} 
                value={ajihen.ingredient}
                onChange={(e) => updateAjihen(index, 'ingredient', e.target.value)}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
              />

              {/* 削除ボタン */}
              <button 
                type="button" 
                onClick={() => removeAjihen(index)}
                style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
              >
                ✖
              </button>
            </div>
          ))}

          <button 
            type="button" 
            onClick={addAjihen}
            style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
          >
            {REGISTER_FORM.ADD_FLAVOR_CHANGE}
          </button>
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: isEditMode ? '#f39c12' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
          🍜 {isEditMode ? REGISTER_FORM.UPDATE_BUTTON : REGISTER_FORM.REGISTER_BUTTON}
        </button>

        {/* 緯度経度フィールドはユーザーに見えないように隠しフィールドとして残しておく */}
        <input type="hidden" name="latitude" value={formData.latitude} />
        <input type="hidden" name="longitude" value={formData.longitude} />
      </form>
    </main>
  );
}

export default function RegisterRamenPage() {
  return (
    // fallback は読み込み中に一瞬表示される内容
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}