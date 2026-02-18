import { Global, Module } from '@nestjs/common';
import { CursorService } from './pagination.cursor';

@Global()
@Module({
  providers: [CursorService],
  exports: [CursorService],
})
export class PaginationModule {}
