import type { ReactNode } from 'react';

export type TLayoutProps = {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
};

export function Layout({ leftPanel, rightPanel }: TLayoutProps) {
  return (
    <div className="flex h-screen min-w-[700px]">
      <aside className="w-[330px] border-r border-gray3 overflow-y-auto">
        {leftPanel}
      </aside>
      <main className="flex-1 overflow-y-auto p-6 pt-4">{rightPanel}</main>
    </div>
  );
}
