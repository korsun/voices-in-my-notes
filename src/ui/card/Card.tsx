import { clsx } from 'clsx';
import { type FC, memo } from 'react';

type TCardProps = {
  title: string;
  text?: string;
  isSelected?: boolean;
  updatedAt?: string; // ISO string
  onClick?: () => void;
  isDisabled?: boolean;
};

export const Card: FC<TCardProps> = memo(
  ({
    title,
    text,
    isSelected = false,
    updatedAt,
    onClick,
    isDisabled = false,
  }) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (isDisabled) {
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        onClick={!isDisabled ? onClick : undefined}
        onKeyDown={handleKeyDown}
        className={clsx(
          'w-[298px] h-[125px] p-4 rounded-custom transition-colors duration-200 overflow-hidden flex flex-col',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          {
            'bg-gray4': isSelected,
            'bg-white hover:bg-gray4': !isSelected && !isDisabled,
            'bg-white cursor-not-allowed': isDisabled,
            'cursor-pointer': !isDisabled,
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
  },
);
