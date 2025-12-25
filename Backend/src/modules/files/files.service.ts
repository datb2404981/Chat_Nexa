import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import toStream = require('streamifier'); // Convert Buffer sang Stream

@Injectable()
export class FilesService {
  async uploadFile(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'chat-app' }, // Tên folder trên Cloudinary
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    
      toStream.createReadStream(file.buffer).pipe(upload);
    });
  }
}
