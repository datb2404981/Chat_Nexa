import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { ResponseMessage } from '../../common/decorator/decorators';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' là tên key trong form-data
  @ResponseMessage("Upload File")
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
        throw new BadRequestException('Không có file nào được gửi lên');
    }
    
    // Validate loại file (Optional - Chỉ cho ảnh và PDF chẳng hạn)
    // if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) ...

    const result = await this.filesService.uploadFile(file);
    
    // Trả về URL để Frontend dùng
    return {
      url: result.secure_url,
      publicId: result.public_id // Để sau này muốn xóa file thì dùng cái này
    };
  }
}