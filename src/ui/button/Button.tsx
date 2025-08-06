import { type ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      disabled = false,
      variant = 'primary',
      isLoading = false,
      fullWidth = false,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-custom transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0 focus:border-0 active:border-0';

    const variantStyles = {
      primary: 'bg-accent text-white hover:bg-hover',
      secondary: 'bg-white text-accent hover:text-hover',
    };

    const sizeStyles = 'py-2 px-4';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles, widthStyles, className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
