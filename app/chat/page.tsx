'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ChatHeader } from '@/components/chat/chat-header';
import { RepositorySidebar } from '@/components/chat/repository-sidebar';
import { ChatArea } from '@/components/chat/chat-area';

export default function ChatPage() {
  const router = useRouter();
  const { repository, isLoading, setIsLoading } = useAppStore();

  useEffect(() => {
    // Redirect to home if no repository is set
    if (!repository) {
      router.push('/');
      return;
    }

    // Simulate loading/processing the repository
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [repository, router, isLoading, setIsLoading]);

  if (!repository) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader />
      <div className="flex-1 flex overflow-hidden">
        <RepositorySidebar />
        <ChatArea />
      </div>
    </div>
  );
}

