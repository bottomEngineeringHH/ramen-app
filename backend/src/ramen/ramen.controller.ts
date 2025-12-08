// backend/src/ramen/ramen.controller.ts

import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Param, BadRequestException, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { RamenService } from './ramen.service';
import { CreateRamenDto } from './dto/create-ramen.dto';
import { UpdateRamenDto } from './dto/update-ramen.dto';
import { MESSAGES } from '../../../app/constants/messages_ja';
import { NextAuthGuard } from '../auth/next-auth.guard';

// @Controller('ramen'): APIのルートパスを /ramen に設定 (例: http://localhost:3001/ramen)
@Controller('ramen')
export class RamenController {
  // RamenServiceを注入
  constructor(private readonly ramenService: RamenService) { }

  @Get('masters')
  async getMasters() {
    return this.ramenService.getMasters();
  }

  // GET /ramen (全ラーメンレビュー一覧を取得)
  @Get()
  async findAll() {
    return this.ramenService.findAll();
  }

  // 登録API
  @Post()
  @UseGuards(NextAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createRamenDto: CreateRamenDto, @Req() req: any) {
    // req.user (JwtStrategyのvalidate()が返したオブジェクト) からuserIdを取得
    const userId = req.user.userId;
    return this.ramenService.create(createRamenDto, userId);
  }

  // 更新API
  @Patch(':id')
  @UseGuards(NextAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updateRamenDto: UpdateRamenDto, @Req() req: any) {
    // TODO: レビューの投稿者(authorId)と、今リクエストしてきたユーザー(req.user.userId)が
    // 一致するかどうかをService層でチェックするロジックが必要

    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw new BadRequestException(MESSAGES.E_INVALID_REVIEW_ID);
    }
    return this.ramenService.update(reviewId, updateRamenDto);
  }

  // 削除API 
  @Delete(':id')
  @UseGuards(NextAuthGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
        throw new BadRequestException(MESSAGES.E_INVALID_REVIEW_ID);
    }
    return this.ramenService.remove(reviewId);
  }

  // GET /ramen/:id (特定のIDのラーメンレビューを取得)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw new BadRequestException(MESSAGES.E_INVALID_REVIEW_ID);
    }
    return this.ramenService.findOne(reviewId); // サービスには数値で渡す
  }
}