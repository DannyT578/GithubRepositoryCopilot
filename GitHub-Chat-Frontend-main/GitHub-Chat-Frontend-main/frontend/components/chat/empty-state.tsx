'use client';

import { Card } from '@/components/ui/card';
import { Sparkles, Github } from 'lucide-react';
import { Repository } from '@/lib/store';

interface EmptyStateProps {
  repository: Repository;
  onQuestionClick?: (question: string) => void;
}

export function EmptyState({ repository }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="p-8 max-w-lg text-center space-y-6 bg-gradient-to-br from-card to-card/50 border-border/50">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg">
            <Github className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Repository Ready!</h2>
          <p className="text-muted-foreground">
            I&apos;ve analyzed <span className="font-semibold text-foreground">{repository.owner}/{repository.name}</span>
          </p>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Ask me anything about this repository</span>
          </div>
          <ul className="text-left space-y-2 max-w-sm mx-auto">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Code structure and architecture</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Component implementations</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Issues and discussions</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Contributing guidelines</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Type your question below or click on a suggested question
          </p>
        </div>
      </Card>
    </div>
  );
}

