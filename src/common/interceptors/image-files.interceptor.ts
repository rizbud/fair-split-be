import { FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { GeneralException } from '../exception';

export const ImageFilesInterceptor = (
  fieldName: string,
  maxCount = 10,
  options?: MulterOptions,
) => {
  return FilesInterceptor(fieldName, maxCount, {
    ...options,
    limits: { fileSize: 1024 * 1024 * 2 }, // 2MB
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return cb(new GeneralException(400, 'Invalid file type'), false);
      }
      cb(null, true);
    },
  });
};
