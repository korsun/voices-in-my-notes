import type { ReactNode } from 'react';

export type TLayoutProps = {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
};

export function Layout({ leftPanel, rightPanel }: TLayoutProps) {
  return (
    <main className="flex h-screen">
      <div className="w-[330px] border-r border-gray3 overflow-y-auto">{leftPanel}</div>
      <div className="flex-1 overflow-y-auto p-6 pt-4">{rightPanel}</div>
    </main>
  );
}
