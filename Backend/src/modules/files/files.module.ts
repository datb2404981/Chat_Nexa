import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { CloudinaryProvider } from './cloudinary.peovider';


@Module({
  controllers: [FilesController],
  providers: [CloudinaryProvider, FilesService],
  exports: [FilesService] // Export để module khác dùng nếu cần
})
export class FilesModule {}