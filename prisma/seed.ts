// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 1. ジャンルマスタの初期データ
  const genres = ['醤油', '塩', '味噌', '豚骨', '魚介系', '鶏白湯', '家系', '二郎系', 'その他']
  for (const name of genres) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // 2. 麺の種類マスタの初期データ
  const noodles = ['細麺ストレート', '太麺ストレート', '細ちぢれ麺', '太ちぢれ麺', '極太麺', '低加水麺', '春雨/その他']
  for (const name of noodles) {
    await prisma.noodleType.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // 3. 食べるシーンマスタの初期データ
  const scenes = ['飲んだ後', 'がっつり食べたい', 'あっさりしたい', 'デート', '家族と', '残業後', '一人でサクッと']
  for (const name of scenes) {
    await prisma.eatingScene.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })