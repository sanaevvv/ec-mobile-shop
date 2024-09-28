import { notFound } from 'next/navigation';
import { db } from '@/db';
import { DesignConfiguration } from './DesignConfiguration';

type Props = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

const DesignPage = async ({ searchParams }: Props) => {
  const { id } = searchParams;

  if (!id || typeof id !== 'string') {
    return notFound();
  }

  const configuration = await db.configuration.findUnique({
    where: {
      id,
    },
  });

  console.log(configuration);

  if (!configuration) return notFound();

  const { imageUrl, width, height } = configuration;

  return (
    <DesignConfiguration
      configId={configuration.id}
      imageUrl={imageUrl}
      imageDimensions={{ width, height }}
    />
  );
};

export default DesignPage;
