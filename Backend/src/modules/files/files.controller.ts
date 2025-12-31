import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { ResponseMessage } from '../../common/decorator/decorators';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file')) // 'file' là tên key trong form-data
  @ResponseMessage("Upload Avatar")
  async uploadAvatarFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
        throw new BadRequestException('Không có file nào được gửi lên');
    }
    
    // Validate loại file (Optional - Chỉ cho ảnh và PDF chẳng hạn)
    // if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) ...

    const result = await this.filesService.uploadFile(file, "chat-app/avatars");
    
    // Trả về URL để Frontend dùng
    return {
      url: result.secure_url,
      publicId: result.public_id // Để sau này muốn xóa file thì dùng cái này
    };
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file')) // 'file' là tên key trong form-data
  @ResponseMessage("Upload File")
  async uploadImgConversation(
    @UploadedFile() file: Express.Multer.File,
    @Body("conversationId")conversationId: string) {
    if (!file) {
        throw new BadRequestException('Không có file nào được gửi lên');
    }

    if (!conversationId) {
        throw new BadRequestException('Thiếu conversationId');
    }
    
    // Validate loại file (Optional - Chỉ cho ảnh và PDF chẳng hạn)
    // if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) ...

    const result = await this.filesService.uploadFile(file, `chat-app/conversation/${conversationId}`);
    
    // Trả về URL để Frontend dùng
    return {
      url: result.secure_url,
      publicId: result.public_id // Để sau này muốn xóa file thì dùng cái này
    };
  }
}