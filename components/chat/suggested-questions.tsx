'use client';

import { Card } from '@/components/ui/card';
import { MessageSquare, Code, GitBranch, FileSearch } from 'lucide-react';

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

const questions = [
  {
    icon: Code,
    question: "What's the main architecture of this project?",
    category: 'Architecture',
  },
  {
    icon: GitBranch,
    question: 'How do I get started contributing to this project?',
    category: 'Contributing',
  },
  {
    icon: FileSearch,
    question: 'What are the key components and their purposes?',
    category: 'Components',
  },
  {
    icon: MessageSquare,
    question: 'Are there any known issues or limitations?',
    category: 'Issues',
  },
];

export function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>Suggested questions to get started:</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {questions.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              key={index}
              className="p-3 hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => onQuestionClick(item.question)}
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                    {item.question}
                  </p>
                  <span className="text-xs text-muted-foreground">{item.category}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

