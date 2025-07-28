# Modern SPA Template

This template provides a modern single-page application setup with:

- Vite as the build tool
- React 19 with TypeScript
- ESLint for code linting
- Tailwind CSS for styling
- pnpm as the package manager

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v7 or higher)

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Available Scripts

- `pnpm run dev` - Start development server with HMR
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview the production build
- `pnpm run lint` - Run ESLint

## Features

- TypeScript with strict mode
- React 19 with Fast Refresh
- Tailwind CSS with plugins:
  - @tailwindcss/forms
  - @tailwindcss/typography
  - @tailwindcss/aspect-ratio
  - @tailwindcss/line-clamp
- ESLint configuration for TypeScript and React
- Modern Vite configuration

## License

MIT
