'use client';

import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useUploadThing } from '@/lib/uploadting';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Loader2, MousePointerSquareDashed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';

const UploadPage = () => {
  const { toast }= useToast();
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    // アップロード完了時に呼び出されるコールバック関数
    onClientUploadComplete: ([data]) => {
      // サーバーから返された configId を使用して新しいページに遷移
      const configId = data.serverData.configId;

      startTransition(() => {
        router.push(`/configure/design?id=${configId}`);
      });
    },
    // アップロードの進行状況をリアルタイムで監視（ p は進捗情報を含むオブジェクト)
    onUploadProgress(p) {
      setUploadProgress(p);
    },
  });

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    // 複数のファイルが拒否された場合でも、最初の拒否されたファイルのみを処理
    const [file] = rejectedFiles;

    setIsDragOver(false);

    toast({
      title: `${file.file.type} type is not supported.`,
      description: 'Please choose a PNG, JPG or JPEG image instead.',
      variant:'destructive'
   })
  };

  const onDropAccepted = (acceptedFiles: File[]) => {
    // アップロード開始
    startUpload(acceptedFiles, {
      // アップロードプロセスに追加の情報やオプションを渡すために使用
      // middleware 関数内で input オブジェクトとしてアクセス
      configId: undefined,
    });

    setIsDragOver(false);
  };

  return (
    // ドロップゾーンのコンテナ
    <div
      className={cn(
        'relative h-full flex-1 my-16 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center flex-col items-center',
        {
          'ring-blue-900/25 bg-blue-900/10': isDragOver,
        }
      )}
    >
      <div className="relative flex flex-1 flex-col items-center justify-center w-full">
        <Dropzone
          onDropRejected={onDropRejected}
          onDropAccepted={onDropAccepted}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg'],
            'image/jpg': ['.jpg'],
          }}
          // ドラッグされている要素がコンテナに入った時と出た時
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
        >
          {/* 親コンポーネントから提供されるメソッドを引数として受け取ります */}
          {({ getRootProps, getInputProps }) => (
            // ドラッグ&ドロップ機能に必要なプロパティとイベントハンドラを含むオブジェクトを返す
            <div
              className="h-full w-full flex-1 flex flex-col items-center justify-center"
              {...getRootProps()}
            >
            {/* ファイル入力に必要なプロパティとイベントハンドラを返す */}
              <input {...getInputProps()} />

              {isDragOver ? (
                <MousePointerSquareDashed className="h-6 w-6 text-zinc-500 mb-2" />
              ) : isUploading || isPending ? (
                <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
              ) : (
                <ImageIcon className="h-6 w-6 text-zinc-500 mb-2" />
              )}

              <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
                {/* 状態に基づいて、異なるメッセージを表示 */}
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <p>Uploading...</p>
                    <Progress
                      value={uploadProgress}
                      className="mt-2 w-40 h-2 bg-gray-300"
                    />
                  </div>
                ) : isPending ? (
                  <div className="flex flex-col items-center">
                    <p>Redirecting, please wait...</p>
                  </div>
                ) : isDragOver ? (
                  <p>
                    <span className="font-semibold">Drop file</span> to upload
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                )}
              </div>

              {isPending ? null : (
                <p className="text-xs text-zinc-500">PNG, JPG, JPEG</p>
              )}
            </div>
          )}
        </Dropzone>
      </div>
    </div>
  );
};

export default UploadPage;
