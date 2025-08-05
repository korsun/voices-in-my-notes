import { type FC, memo } from 'react';
import { clsx } from 'clsx';

type TCardProps = {
  title: string;
  text?: string;
  isSelected?: boolean;
  updatedAt?: string; // ISO string
};

export const Card: FC<TCardProps> = memo(({ title, text, isSelected = false, updatedAt }) => {
  return (
    <div
      className={clsx(
        'w-[298px] h-[125px] p-4 rounded-custom transition-colors duration-200 hover:bg-gray4 overflow-hidden flex flex-col hover:cursor-pointer',
        {
          'bg-gray4': isSelected,
          'bg-white': !isSelected,
        },
      )}
    >
      <div className="flex-1 flex flex-col">
        <h2 className="body-1 mb-2 line-clamp-1 leading-snug">{title}</h2>
        <p className="body-2 line-clamp-2 text-gray2 flex-1">{text}</p>
      </div>
      <p className="body-2 text-gray2 text-right mt-2">
        {updatedAt ? new Date(updatedAt).toLocaleString() : ''}
      </p>
    </div>
  );
});
