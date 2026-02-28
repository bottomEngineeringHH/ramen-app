// backend/src/ramen/dto/create-ramen.dto.ts

// NestJSの入力検証ライブラリから必要なデコレーターをインポート
import { IsArray, IsString, IsNumber, IsOptional, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRamenDto {
  // --- 必須項目 ---
  
  // @IsNotEmpty(): 値が空でないことを保証
  // @IsString(): 値が文字列であることを保証
  @Type(() => String)
    @IsNotEmpty()
    @IsString()
    storeName!: string;

  // @IsNumber(): 値が数値であることを保証
  @IsNotEmpty()
    @IsNumber()
    latitude!: number;

  @IsNotEmpty()
    @IsNumber()
    longitude!: number;
  
  // @IsInt(): 値が整数であることを保証
  // @Min(1): IDはマスタの主キーなので、1以上であることを保証
  @IsNotEmpty()
    @IsInt()
    @Min(1)
    genreId!: number;

  @IsNotEmpty()
    @IsInt()
    @Min(1)
    noodleId!: number;

  @IsNotEmpty()
    @IsInt()
    @Min(1)
    eatingSceneId!: number;

  @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imageUrl?: string[];

  // --- 任意項目 ---
  
  // @IsOptional(): 値があってもなくても良いことを示す
  // @IsString(): 文字列であることのみ保証
  @IsOptional()
  @IsString()
  comment?: string; // ? はTypeScriptで任意（オプショナル）であることを示す

  @IsOptional()
  @IsInt()
  vibe?: number; // 雰囲気の評価（例: 1, 2, 3）
}