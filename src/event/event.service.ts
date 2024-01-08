import { Injectable } from '@nestjs/common';

import { PrismaService } from '~/prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private readonly prismaService: PrismaService) {}

  getEventBySlug(slug: string) {
    return this.prismaService.event.findUnique({ where: { slug } });
  }
}
