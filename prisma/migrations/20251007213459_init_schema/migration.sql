-- CreateTable
CREATE TABLE "RamenStore" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,

    CONSTRAINT "RamenStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RamenReview" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    "noodleId" INTEGER NOT NULL,
    "eatingSceneId" INTEGER NOT NULL,
    "comment" TEXT,
    "vibe" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RamenReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoodleType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "NoodleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EatingScene" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EatingScene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RamenStore_name_key" ON "RamenStore"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NoodleType_name_key" ON "NoodleType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EatingScene_name_key" ON "EatingScene"("name");

-- AddForeignKey
ALTER TABLE "RamenReview" ADD CONSTRAINT "RamenReview_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "RamenStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RamenReview" ADD CONSTRAINT "RamenReview_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RamenReview" ADD CONSTRAINT "RamenReview_noodleId_fkey" FOREIGN KEY ("noodleId") REFERENCES "NoodleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RamenReview" ADD CONSTRAINT "RamenReview_eatingSceneId_fkey" FOREIGN KEY ("eatingSceneId") REFERENCES "EatingScene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
