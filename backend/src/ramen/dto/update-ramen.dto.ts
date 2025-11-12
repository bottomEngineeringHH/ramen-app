// backend/src/ramen/dto/update-ramen.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateRamenDto } from './create-ramen.dto';

export class UpdateRamenDto extends PartialType(CreateRamenDto) {}