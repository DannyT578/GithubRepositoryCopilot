'use client';

import { useAppStore } from '@/lib/store';
import { RepositoryInfo } from './repository-info';

export function RepositorySidebar() {
  const { repository } = useAppStore();

  if (!repository) return null;

  return (
    <aside className="hidden md:flex w-80 border-r border-border bg-muted/30 flex-col">
      <div className="p-4">
        <RepositoryInfo />
      </div>
    </aside>
  );
}
