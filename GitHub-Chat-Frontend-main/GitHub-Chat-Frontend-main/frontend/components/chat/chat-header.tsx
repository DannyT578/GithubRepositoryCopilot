'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Github, Home, RotateCcw, Menu } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { RepositoryInfo } from './repository-info';

export function ChatHeader() {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { repository, clearChat, reset } = useAppStore();

  const handleNewRepository = () => {
    reset();
    router.push('/');
  };

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 group"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Github className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold group-hover:text-primary transition-colors">
              Chat with GitHub
            </span>
          </button>
          
          {repository && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground">Analyzing:</span>
              <span className="text-sm font-medium">{repository.owner}/{repository.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Repository Info</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <RepositoryInfo />
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewRepository}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">New Repository</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

