import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import toStream = require('streamifier'); // Convert Buffer sang Stream

@Injectable()
export class FilesService {
  async uploadFile(file: Express.Multer.File, folder: string = "chat-app"): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'docx', 'xlsx', 'zip'],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    
      toStream.createReadStream(file.buffer).pipe(upload);
    });
  }
}
