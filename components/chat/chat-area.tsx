'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, AlertCircle, X, ArrowDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { sendChatMessage, ApiError } from '@/lib/api';
import { ChatMessage } from './chat-message';
import { EmptyState } from './empty-state';
import { SuggestedQuestions } from './suggested-questions';

export function ChatArea() {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isNearBottom = useCallback(() => {
    const el = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  const {
    repository,
    messages,
    addMessage,
    error,
    setError,
    chatModel,
    chatApiKey,
    embedApiKey,
  } = useAppStore();

  // Only auto-scroll when already near the bottom
  useEffect(() => {
    if (isNearBottom()) scrollToBottom();
  }, [messages, sending, isNearBottom, scrollToBottom]);

  // Show/hide scroll-to-bottom button based on scroll position
  useEffect(() => {
    const el = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!el) return;
    const onScroll = () => setShowScrollBtn(!isNearBottom());
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isNearBottom]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || sending || !repository) return;

    setInput('');
    setSending(true);

    // Snapshot history before adding the new user message
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    // Optimistic user message
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    });

    try {
      const { answer, sources } = await sendChatMessage(
        repository.owner,
        repository.name,
        question,
        history,
        chatModel,
        chatApiKey,
        embedApiKey,
      );
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
        sources,
        timestamp: new Date(),
      });
    } catch (e) {
      const errMsg = e instanceof ApiError ? e.message : 'An error occurred. Please try again.';
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `**Error:** ${errMsg}`,
        timestamp: new Date(),
      });
      setError(errMsg);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!repository) return null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border-b border-destructive/30 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="flex-shrink-0 rounded p-0.5 hover:bg-destructive/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Message list */}
      <div className="relative flex-1 overflow-hidden" ref={scrollAreaRef}>
        <ScrollArea className="h-full p-4">
        <div className="max-w-3xl mx-auto space-y-4 pb-2">
          {messages.length === 0 ? (
            <div className="space-y-8">
              <EmptyState repository={repository} />
              <SuggestedQuestions onQuestionClick={(q) => setInput(q)} />
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          {/* Typing indicator */}
          {sending && (
            <div className="flex gap-3 items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
              </div>
              <span className="text-sm text-muted-foreground">Thinking…</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full shadow-md gap-1.5 px-3"
              onClick={() => scrollToBottom()}
            >
              <ArrowDown className="h-3.5 w-3.5" />
              Scroll to bottom
            </Button>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-background/95 backdrop-blur p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this repository…"
            className="flex-1"
            disabled={sending}
            autoFocus
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            size="icon"
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2 select-none">
          Press Enter to send
        </p>
      </div>
    </div>
  );
}
