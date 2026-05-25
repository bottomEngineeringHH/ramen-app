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
import exifr from 'exifr';
import heic2any from 'heic2any';

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

  // EXIFから取得した情報を保持するためのState
  const [inferredAddress, setInferredAddress] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>('');

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

  // 画像アップロード時の拡張ハンドラ (EXIF解析と住所取得を統合)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // HEIC形式のチェック
    const isHeic = selectedFile.name.toLowerCase().endsWith('.heic') || selectedFile.type === 'image/heic';

    try {
      // 表示用のBlob（HEICなら変換、それ以外ならそのまま）
      let displayFile: Blob | File = selectedFile;

      if (isHeic) {
        // HEICをJPEGに変換（プレビュー用）
        const converted = await heic2any({
          blob: selectedFile,
          toType: 'image/jpeg',
          quality: 0.8
        });
        // 複数の画像が返る可能性があるため、配列なら最初の要素を取得
        displayFile = Array.isArray(converted) ? converted[0] : converted;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(displayFile));

      // EXIFデータの解析
      const exifData = await exifr.parse(selectedFile, true);
      
      // 撮影日時の抽出とセット
      if (exifData?.DateTimeOriginal) {
        const d = new Date(exifData.DateTimeOriginal);
        const dateStr = d.toISOString().split('T')[0];
        setPhotoDate(dateStr);
      }

      // 位置情報の抽出と逆ジオコーディング(OpenStreetMap Nominatim API)
      if (exifData?.latitude && exifData?.longitude) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${exifData.latitude}&lon=${exifData.longitude}`
        );
        const locationData = await res.json();
        if (locationData?.display_name) {
          setInferredAddress(locationData.display_name);
        }
        // 必要に応じてフォームの緯度経度を更新
        setFormData(prev => ({ ...prev, latitude: exifData.latitude, longitude: exifData.longitude }));
      } else {
        console.log('位置情報なし');
      }
    } catch (error) {
      console.error('EXIF抽出エラー:', error);
    }
  };

  // データの読み込み待ち
  if (isLoading || !masters) {
    return <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="text-white text-xl">{isEditMode ? MESSAGES.L_LOADING_EDIT : MESSAGES.L_LOADING_FORM}</div></main>;
  }

  // --- 4. フォームのレンダリング ---
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white px-4 font-sans py-10 flex justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <Link href="/list" className="text-slate-400 hover:text-white transition underline">
            {LIST_PAGE.BACK_TO_LIST}
          </Link>
        </div>

        <div className="mb-8 text-center border-b-2 border-orange-500 pb-4">
          <h1 className="text-4xl font-extrabold tracking-tight">{isEditMode ? MESSAGES.TITLE_EDIT(reviewId!) : MESSAGES.TITLE_REGISTER}</h1>
        </div>

        {message && <div className={`mb-6 p-4 rounded-lg border text-center ${message.startsWith(REGISTER_FORM.ERROR) ? 'bg-red-900/20 text-red-400 border-red-500/30' : 'bg-green-900/20 text-green-400 border-green-500/30'}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#1A1A1A] border border-slate-700 rounded-2xl p-8">

        {/* --- 画像アップロード (順番を一番上に移動し、店舗推測のUIを追加) --- */}
        <div className="p-4 border border-slate-600 rounded-lg bg-slate-800/30">
          <label className="block text-sm font-bold mb-2 text-slate-300">{REGISTER_FORM.PHOTO}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white hover:file:bg-slate-600 mb-4"
          />
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="w-24 mt-3 rounded-lg border border-slate-600 mx-auto mb-4" />
          )}

          {/* EXIF解析結果の表示領域 */}
          {(photoDate || inferredAddress) && (
             <div className="mt-4 p-3 bg-slate-700/50 rounded text-sm text-slate-300 border border-slate-600">
               <p className="font-bold text-orange-400 mb-2">{REGISTER_FORM.GUESS_FROM_PHOTO}</p>
               {photoDate && <p>{REGISTER_FORM.PHOTO_DATE} {photoDate}</p>}
               {inferredAddress && <p>{REGISTER_FORM.PHOTO_LOCATION} {inferredAddress}</p>}
             </div>
          )}
        </div>

        {/* --- 店名 --- */}
        <div>
          <label htmlFor="storeName" className="block text-sm font-bold mb-2 text-slate-300">{REGISTER_FORM.STORE_NAME}</label>
          <input
            id="storeName"
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white transition ${errors.storeName ? 'border-red-500' : 'border-slate-600 focus:border-orange-500'} focus:outline-none`}
          />
          {errors.storeName && <p className="text-red-400 text-sm mt-2">{errors.storeName}</p>}
          <p className="text-slate-400 text-sm mt-2">{REGISTER_FORM.LOCATION_CONFIRMED}</p>
        </div>

        {/* --- 場所 (緯度経度は固定値を使用) --- */}
        <div>
          <label htmlFor="location" className="block text-sm font-bold mb-2 text-slate-300">{REGISTER_FORM.STATION}</label>
          <input
            id="location"
            type="text"
            name="nearestStation"
            onChange={handleChange}
            placeholder={REGISTER_FORM.STATION_PLACEHOLDER}
            className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white transition ${errors.latitude ? 'border-red-500' : 'border-slate-600 focus:border-orange-500'} focus:outline-none`}
          />
          <p className="text-slate-400 text-sm mt-2">{REGISTER_FORM.LOCATION_CONFIRMED}</p>
          {(errors.latitude) && <p className="text-red-400 text-sm mt-2">{MESSAGES.E_REQUIRED_STATION}</p>}
        </div>

        {/* --- ジャンル (マスタデータ利用) --- */}
        <div>
          <label htmlFor="genreId" className="block text-sm font-bold mb-2 text-slate-300">{REGISTER_FORM.GENRE}</label>
          <select
            id="genreId"
            name="genreId"
            value={formData.genreId}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white transition ${errors.genreId ? 'border-red-500' : 'border-slate-600 focus:border-orange-500'} focus:outline-none`}
          >
            <option value={0}>{REGISTER_FORM.SELECT_PLACEHOLDER}</option>
            {masters?.genres?.map((item: MasterItem) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.genreId && <p className="text-red-400 text-sm mt-2">{errors.genreId}</p>}
        </div>

        {/* --- 麺の種類 --- */}
        <div>
          <label htmlFor="noodleId" className="block text-sm font-bold mb-2 text-slate-300">{REGISTER_FORM.NOODLE}</label>
          <select
            id="noodleId"
            name="noodleId"
            value={formData.noodleId}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white transition ${errors.noodleId ? 'border-red-500' : 'border-slate-600 focus:border-orange-500'} focus:outline-none`}
          >
            <option value={0}>{REGISTER_FORM.SELECT_PLACEHOLDER}</option>
            {masters?.noodleTypes?.map((item: MasterItem) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.noodleId && <p className="text-red-400 text-sm mt-2">{errors.noodleId}</p>}
        </div>

        {/* --- オススメの食べるシーン --- */}
        <div>
          <label htmlFor="eatingSceneId" className="block text-sm font-bold mb-2 text-slate-300">{REGISTER_FORM.SCENE}</label>
          <select
            id="eatingSceneId"
            name="eatingSceneId"
            value={formData.eatingSceneId}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white transition ${errors.eatingSceneId ? 'border-red-500' : 'border-slate-600 focus:border-orange-500'} focus:outline-none`}
          >
            <option value={0}>{REGISTER_FORM.SELECT_PLACEHOLDER}</option>
            {masters?.eatingScenes?.map((item: MasterItem) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.eatingSceneId && <p className="text-red-400 text-sm mt-2">{errors.eatingSceneId}</p>}
        </div>

        {/* --- 雰囲気 (ラジオボタン: 任意) --- */}
        <div className="text-center">
          <label className="block text-sm font-bold mb-3 text-slate-300">{REGISTER_FORM.VIBE}</label>
          <div className="flex gap-6 justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vibe"
                value={1}
                checked={formData.vibe === 1}
                onChange={handleChange}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-slate-300">{REGISTER_FORM.VIBE_GOOD}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vibe"
                value={2}
                checked={formData.vibe === 2}
                onChange={handleChange}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-slate-300">{REGISTER_FORM.VIBE_NORMAL}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vibe"
                value={3}
                checked={formData.vibe === 3}
                onChange={handleChange}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-slate-300">{REGISTER_FORM.VIBE_DEEP}</span>
            </label>
          </div>
        </div>

        {/* --- 7. フリーコメント --- */}
        <div>
          <label htmlFor="comment" className="block text-sm font-bold mb-2 text-slate-300">{REGISTER_FORM.COMMENT}</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* --- 8.味変タイムライン入力エリア --- */}
        <div className="p-6 border border-dashed border-slate-600 rounded-lg bg-slate-800/50 text-center">
          <h3 className="mb-4 text-lg font-bold text-orange-400">{REGISTER_FORM.FLAVOR_CHANGE_TIMELINE}</h3>

          {ajihenList.map((ajihen, index) => (
            <div key={index} className="flex items-end gap-3 mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600 mx-auto max-w-md">

              {/* スライダー（0〜100） */}
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 mb-2">{REGISTER_FORM.INJECTION_TIMING} {ajihen.percent}%</label>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={ajihen.percent}
                  onChange={(e) => updateAjihen(index, 'percent', Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              {/* 調味料の名前入力 */}
              <input
                type="text"
                placeholder={REGISTER_FORM.INGREDIENT_PLACEHOLDER}
                value={ajihen.ingredient}
                onChange={(e) => updateAjihen(index, 'ingredient', e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white flex-1 focus:border-orange-500 focus:outline-none"
              />

              {/* 削除ボタン */}
              <button
                type="button"
                onClick={() => removeAjihen(index)}
                className="text-red-400 hover:text-red-300 transition text-xl font-bold"
              >
                ✖
              </button>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={addAjihen}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-bold"
            >
              {REGISTER_FORM.ADD_FLAVOR_CHANGE}
            </button>
          </div>
        </div>

        <button type="submit" className={`w-full px-4 py-3 ${isEditMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition font-bold text-lg`}>
          🍜 {isEditMode ? REGISTER_FORM.UPDATE_BUTTON : REGISTER_FORM.REGISTER_BUTTON}
        </button>

        {/* 緯度経度フィールドはユーザーに見えないように隠しフィールドとして残しておく */}
        <input type="hidden" name="latitude" value={formData.latitude} />
        <input type="hidden" name="longitude" value={formData.longitude} />
      </form>
      </div>
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