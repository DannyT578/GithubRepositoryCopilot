'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { User, Sparkles, FileCode, MessageSquare, ExternalLink } from 'lucide-react';
import { Message } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './code-block';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <Avatar className={`h-8 w-8 flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-muted' : 'bg-primary'
      }`}>
        {isUser ? (
          <User className="h-4 w-4 text-foreground" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        )}
      </Avatar>

      {/* Message Content */}
      <div className="flex-1 space-y-2">
        <Card className={`p-4 ${isUser ? 'bg-muted/50' : 'bg-card'}`}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-sm" {...props}>
                        {children}
                      </code>
                    );
                  }
                  
                  return (
                    <CodeBlock
                      language={match[1]}
                      code={String(children).replace(/\n$/, '')}
                    />
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </Card>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sources" className="border rounded-lg bg-muted/30">
              <AccordionTrigger className="px-4 py-2 hover:no-underline text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FileCode className="h-3.5 w-3.5" />
                  View {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-2">
                  {message.sources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 rounded bg-background/50 hover:bg-background transition-colors"
                    >
                      <div className="mt-0.5">
                        {source.type === 'code' ? (
                          <FileCode className="h-4 w-4 text-primary" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {source.type === 'code' ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">{source.file}</span>
                              <Badge variant="secondary" className="text-xs">
                                Lines {source.lineStart}-{source.lineEnd}
                              </Badge>
                            </div>
                            {source.snippet && (
                              <code className="text-xs text-muted-foreground block truncate">
                                {source.snippet}
                              </code>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-medium mb-1">{source.title}</div>
                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                View on GitHub
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

