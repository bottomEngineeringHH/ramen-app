/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./backend/src/app.module.ts":
/*!***********************************!*\
  !*** ./backend/src/app.module.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// backend/src/app.module.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ./prisma/prisma.service */ "./backend/src/prisma/prisma.service.ts"); // PrismaServiceをインポート
const ramen_module_1 = __webpack_require__(/*! ./ramen/ramen.module */ "./backend/src/ramen/ramen.module.ts");
// @Module デコレーター: このファイルがNestJSのモジュールであることを定義します。
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [ramen_module_1.RamenModule], // 他のモジュールがあればここに追加します
        controllers: [], // APIエンドポイントを定義するコントローラーがあればここに追加します
        // providers: アプリケーション全体で共有し、他のサービスやコントローラーに注入（使用）できるようにするサービス
        providers: [prisma_service_1.PrismaService],
    })
], AppModule);


/***/ }),

/***/ "./backend/src/prisma/prisma.service.ts":
/*!**********************************************!*\
  !*** ./backend/src/prisma/prisma.service.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// backend/src/prisma/prisma.service.ts (修正後)
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super();
    }
    // アプリケーション起動時: データベースに接続
    async onModuleInit() {
        await this.$connect();
        console.log('PrismaService: Database connected successfully.');
    }
    // アプリケーション終了時: データベース接続を安全に切断
    async onModuleDestroy() {
        await this.$disconnect(); // $disconnect()を使って接続を閉じます
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
    // OnModuleInitだけでなく、OnModuleDestroyインターフェースも実装します。
    ,
    __metadata("design:paramtypes", [])
], PrismaService);


/***/ }),

/***/ "./backend/src/ramen/dto/create-ramen.dto.ts":
/*!***************************************************!*\
  !*** ./backend/src/ramen/dto/create-ramen.dto.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// backend/src/ramen/dto/create-ramen.dto.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateRamenDto = void 0;
// NestJSの入力検証ライブラリから必要なデコレーターをインポート
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
class CreateRamenDto {
    // --- 必須項目 ---
    // @IsNotEmpty(): 値が空でないことを保証
    // @IsString(): 値が文字列であることを保証
    storeName;
    // @IsNumber(): 値が数値であることを保証
    latitude;
    longitude;
    // @IsInt(): 値が整数であることを保証
    // @Min(1): IDはマスタの主キーなので、1以上であることを保証
    genreId;
    noodleId;
    eatingSceneId;
    // --- 任意項目 ---
    // @IsOptional(): 値があってもなくても良いことを示す
    // @IsString(): 文字列であることのみ保証
    comment; // ? はTypeScriptで任意（オプショナル）であることを示します
    vibe; // 雰囲気の評価（例: 1, 2, 3）
}
exports.CreateRamenDto = CreateRamenDto;
__decorate([
    (0, class_transformer_1.Type)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRamenDto.prototype, "storeName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRamenDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRamenDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateRamenDto.prototype, "genreId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateRamenDto.prototype, "noodleId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateRamenDto.prototype, "eatingSceneId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRamenDto.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateRamenDto.prototype, "vibe", void 0);


/***/ }),

/***/ "./backend/src/ramen/ramen.controller.ts":
/*!***********************************************!*\
  !*** ./backend/src/ramen/ramen.controller.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// backend/src/ramen/ramen.controller.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RamenController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const ramen_service_1 = __webpack_require__(/*! ./ramen.service */ "./backend/src/ramen/ramen.service.ts");
const create_ramen_dto_1 = __webpack_require__(/*! ./dto/create-ramen.dto */ "./backend/src/ramen/dto/create-ramen.dto.ts");
// @Controller('ramen'): APIのルートパスを /ramen に設定 (例: http://localhost:3001/ramen)
let RamenController = class RamenController {
    ramenService;
    // RamenServiceを注入
    constructor(ramenService) {
        this.ramenService = ramenService;
    }
    async getMasters() {
        return this.ramenService.getMasters();
    }
    // GET /ramen (全ラーメンレビュー一覧を取得)
    async findAll() {
        return this.ramenService.findAll();
    }
    // @Post() と @UsePipes(new ValidationPipe()) を使用することで、
    // リクエストデータがCreateRamenDtoのルール（@IsNotEmptyなど）を満たしているかを自動でチェックします
    async create(createRamenDto) {
        // サービス層のcreateメソッドを呼び出し
        return this.ramenService.create(createRamenDto);
    }
    // GET /ramen/:id (特定のIDのラーメンレビューを取得)
    async findOne(id) {
        const reviewId = parseInt(id, 10);
        if (isNaN(reviewId)) {
            throw new common_1.BadRequestException('レビューIDが不正です。');
        }
        return this.ramenService.findOne(reviewId); // サービスには数値で渡す
    }
};
exports.RamenController = RamenController;
__decorate([
    (0, common_1.Get)('masters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RamenController.prototype, "getMasters", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RamenController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_ramen_dto_1.CreateRamenDto !== "undefined" && create_ramen_dto_1.CreateRamenDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], RamenController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RamenController.prototype, "findOne", null);
exports.RamenController = RamenController = __decorate([
    (0, common_1.Controller)('ramen'),
    __metadata("design:paramtypes", [typeof (_a = typeof ramen_service_1.RamenService !== "undefined" && ramen_service_1.RamenService) === "function" ? _a : Object])
], RamenController);


/***/ }),

/***/ "./backend/src/ramen/ramen.module.ts":
/*!*******************************************!*\
  !*** ./backend/src/ramen/ramen.module.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// backend/src/ramen/ramen.module.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RamenModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const ramen_controller_1 = __webpack_require__(/*! ./ramen.controller */ "./backend/src/ramen/ramen.controller.ts");
const ramen_service_1 = __webpack_require__(/*! ./ramen.service */ "./backend/src/ramen/ramen.service.ts");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/src/prisma/prisma.service.ts");
let RamenModule = class RamenModule {
};
exports.RamenModule = RamenModule;
exports.RamenModule = RamenModule = __decorate([
    (0, common_1.Module)({
        controllers: [ramen_controller_1.RamenController],
        providers: [ramen_service_1.RamenService, prisma_service_1.PrismaService],
    })
], RamenModule);


/***/ }),

/***/ "./backend/src/ramen/ramen.service.ts":
/*!********************************************!*\
  !*** ./backend/src/ramen/ramen.service.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// backend/src/ramen/ramen.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RamenService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prisma_service_1 = __webpack_require__(/*! ../prisma/prisma.service */ "./backend/src/prisma/prisma.service.ts");
let RamenService = class RamenService {
    prisma;
    // PrismaServiceを注入（DI）
    constructor(prisma) {
        this.prisma = prisma;
    }
    // 一覧情報取得
    async findAll() {
        // PrismaのfindMany()で全レビューを取得
        return this.prisma.ramenReview.findMany({
            // 関連するテーブルのデータも一緒に取得する（JOINのようなもの）
            include: {
                store: true, // 店舗情報（店名、緯度経度）
                genre: true, // ジャンル名
                noodle: true, // 麺の種類名
                eatingScene: true, // シーン名
            },
            // 新しいレビューが上に来るように降順でソート
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    // ラーメンの登録処理
    async create(createRamenDto) {
        // 💡 公序良俗チェックの概念:
        //   この位置で、不適切なコメントを検出するロジックを実装します。
        if (this.containsInappropriateContent(createRamenDto.comment)) {
            throw new common_1.BadRequestException('コメントに不適切な表現が含まれています。');
        }
        // 1. 店舗情報が存在するか、店名で検索 (あれば取得、なければstoreはnull)
        let store = await this.prisma.ramenStore.findUnique({
            where: { name: createRamenDto.storeName },
        });
        // 2. 店舗が存在しない場合、新規作成
        if (!store) {
            store = await this.prisma.ramenStore.create({
                data: {
                    name: createRamenDto.storeName,
                    latitude: createRamenDto.latitude,
                    longitude: createRamenDto.longitude,
                    // addressはDTOにないので省略
                },
            });
        }
        // 3. レビュー情報（ユーザーの評価、マスタIDなど）をDBに登録
        const review = await this.prisma.ramenReview.create({
            data: {
                storeId: store.id, // 作成または取得した店舗IDを使用
                genreId: createRamenDto.genreId,
                noodleId: createRamenDto.noodleId,
                eatingSceneId: createRamenDto.eatingSceneId,
                comment: createRamenDto.comment,
                vibe: createRamenDto.vibe,
            },
        });
        return review;
    }
    // 仮の公序良俗チェック関数（ここではシンプルな例として実装）
    containsInappropriateContent(comment) {
        if (!comment)
            return false;
        const bannedWords = ['だめなワード', 'きんしくワード']; // 実際はリスト化されたDBを参照
        return bannedWords.some(word => comment.includes(word));
    }
    async getMasters() {
        // Promise.allで複数のDBクエリを並行して実行し、高速化
        const [genres, noodleTypes, eatingScenes] = await Promise.all([
            this.prisma.genre.findMany(),
            this.prisma.noodleType.findMany(),
            this.prisma.eatingScene.findMany(),
        ]);
        return { genres, noodleTypes, eatingScenes };
    }
    // 特定のIDのラーメンレビューを取得する処理
    async findOne(id) {
        // PrismaのfindUniqueOrThrow()でID検索を実行
        return this.prisma.ramenReview.findUniqueOrThrow({
            where: { id },
            // 一覧と同じく、関連データも一緒に取得する
            include: {
                store: true,
                genre: true,
                noodle: true,
                eatingScene: true,
            },
        });
    }
};
exports.RamenService = RamenService;
exports.RamenService = RamenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], RamenService);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "class-transformer":
/*!************************************!*\
  !*** external "class-transformer" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*****************************!*\
  !*** ./backend/src/main.ts ***!
  \*****************************/

// backend/src/main.ts
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./backend/src/app.module.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
async function bootstrap() {
    // NestJSアプリケーションのインスタンスを作成
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // CORSを有効にする設定 (フロントエンドの3000番ポートからのアクセスを許可するため)
    app.enableCors({
        origin: 'http://localhost:3000', // Next.jsアプリのオリジン
        credentials: true,
    });
    // グローバルバリデーションパイプを有効化
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true, // DTOクラスへの自動変換を有効化（@Typeデコレーターが機能するために必須）
        whitelist: true, // DTOに定義されていないプロパティを自動的に取り除く
    }));
    // 💡 ポート番号3001でサーバーを起動（Next.jsの3000と競合しないように）
    await app.listen(3001);
    console.log(`NestJS Application is running on: ${await app.getUrl()}`);
}
bootstrap();

})();

/******/ })()
;