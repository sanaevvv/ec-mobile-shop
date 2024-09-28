import { cn } from '@/lib/utils';
import Image from 'next/image';
import { HTMLAttributes } from 'react';

type Props = {
  imgSrc: string;
  dark?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export const Phone = ({ imgSrc, className, dark = false, ...props }: Props) => {
  return (
    <div
      className={cn(
        'relative pointer-events-none z-50 overflow-hidden',
        className
      )}
      {...props}
    >
      <Image
        src={
          dark
            ? '/phone-template-dark-edges.png'
            : '/phone-template-white-edges.png'
        }
        className="pointer-events-none z-50 select-none"
        alt="phone"
        width={300}
        height={300}
      />

      <div className="absolute -z-10 inset-0">
        <Image
          className="object-cover min-w-full min-h-full"
          src={imgSrc}
          alt="overlaying phone"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
};
