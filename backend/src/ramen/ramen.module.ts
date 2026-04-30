// backend/src/ramen/ramen.module.ts

import { Module } from '@nestjs/common';
import { RamenController } from './ramen.controller';
import { RamenService } from './ramen.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { RamenGateway } from './ramen.gateway';

@Module({
  imports: [AuthModule],
  controllers: [RamenController],
  providers: [RamenService, PrismaService, RamenGateway], 
})
export class RamenModule {}