import { Injectable, Logger } from '@nestjs/common';

import { getStorage, ref, uploadBytes } from 'firebase/storage';

import { randomString } from '~/common/utils';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger('FirebaseService');

  async uploadFile(folder: string, file: Express.Multer.File): Promise<string> {
    this.logger.log(`uploadFile: ${file.originalname}`);

    const date = new Date().getTime();

    const fileName =
      randomString(6) + '-' + date + '.' + file.originalname.split('.').pop();
    const storage = getStorage();
    const storageRef = ref(storage, `${folder}/${fileName}`);

    try {
      const upload = await uploadBytes(storageRef, file.buffer, {
        contentType: file.mimetype,
        cacheControl: 'public, max-age=31536000',
      });

      const prefix = 'https://storage.googleapis.com/';
      const bucket = upload.metadata.bucket + '/';

      return prefix + bucket + upload.metadata.fullPath;
    } catch (error) {
      this.logger.error(`Error to uploadFile: ${error}`);
      throw error;
    }
  }
}
