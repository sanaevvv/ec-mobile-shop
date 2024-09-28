import { OurFileRouter } from '@/app/api/uploadthing/core';
import { generateReactHelpers } from '@uploadthing/react';

// useUploadThingはアップロード状態を管理
// uploadFilesはアップロードの結果を直接扱う
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
