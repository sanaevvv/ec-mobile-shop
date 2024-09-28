import { createUploadthing, type FileRouter } from 'uploadthing/next';
import sharp from 'sharp';
import { z } from 'zod';
import { db } from '@/db';

// ファイルアップローダーを作成する関数;
const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .input(
      z.object({
        configId: z.string().optional(),
      })
    )
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // アップロード時に提供されたメタデータから configId を取得
      const { configId } = metadata.input;

      // アップロードされたファイルをダウンロード;
      const res = await fetch(file.url);

      // ファイルデータをバイナリ形式で取得;
      const buffer = await res.arrayBuffer();
      // バイナリデータを画像として扱い(sharp)、そのメタデータ（幅と高さ）を取得
      const { width, height } = await sharp(buffer).metadata();

      if (!configId) {
        // STEP1
        const configuration = await db.configuration.create({
          data: {
            imageUrl: file.url,
            height: height || 500,
            width: width || 500,
          },
        });

        return { configId: configuration.id };
      } else {
        const updatedConfiguration = await db.configuration.update({
          where: {
            id: configId,
          },
          data: {
            croppedImageUrl: file.url,
          },
        });
        return { configId: updatedConfiguration.id };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
