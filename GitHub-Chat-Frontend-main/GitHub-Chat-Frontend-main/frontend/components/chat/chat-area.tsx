'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Send, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ChatMessage } from './chat-message';
import { SuggestedQuestions } from './suggested-questions';
import { EmptyState } from './empty-state';

export function ChatArea() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, isLoading, repository } = useAppStore();

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: generateMockResponse(),
        sources: generateMockSources(),
        timestamp: new Date(),
      };
      addMessage(aiMessage);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Analyzing Repository</h3>
            <p className="text-sm text-muted-foreground">
              Processing code structure, issues, and discussions...
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 md:px-6" ref={scrollRef}>
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {messages.length === 0 ? (
            <EmptyState repository={repository!} onQuestionClick={handleQuestionClick} />
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <Card className="flex-1 p-4 bg-muted/50">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions (shown when no messages) */}
      {messages.length === 0 && !isLoading && (
        <div className="px-4 md:px-6 pb-4">
          <div className="max-w-4xl mx-auto">
            <SuggestedQuestions onQuestionClick={handleQuestionClick} />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border/40 bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about this repository..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </main>
  );
}

// Mock response generator
function generateMockResponse(): string {
  const responses = [
    `Based on the repository structure, I can help you understand this. The main implementation can be found in the \`src/components\` directory. Here's what I found:\n\nThe codebase uses a modular architecture with clear separation of concerns. Each component is self-contained and follows best practices for maintainability.\n\nKey files to look at:\n- \`src/components/ui/button.tsx\`: Contains the button component implementation\n- \`lib/utils.ts\`: Utility functions used throughout the codebase\n\nWould you like me to explain any specific part in more detail?`,
    
    `Great question! Looking at the issues and discussions, this is a common topic. Here's what the maintainers have said:\n\nThe architecture follows a composition-based approach, allowing for maximum flexibility. You can see this pattern implemented throughout the codebase.\n\nThe relevant discussion can be found in Issue #123 where the team explains the design decisions behind this approach.`,
    
    `I've analyzed the code and found several relevant implementations. The main logic is split across multiple files for better organization:\n\n1. Component definitions in \`src/components\`\n2. Utility functions in \`lib/\`\n3. Type definitions in the respective component files\n\nEach component is built with accessibility in mind, using Radix UI primitives as a foundation.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Mock sources generator
function generateMockSources() {
  return [
    {
      type: 'code' as const,
      file: 'src/components/ui/button.tsx',
      lineStart: 12,
      lineEnd: 45,
      snippet: 'export function Button({ className, variant, size, ...props }) { ... }',
    },
    {
      type: 'issue' as const,
      title: 'Discussion: Component Architecture',
      url: 'https://github.com/owner/repo/issues/123',
    },
  ];
}

