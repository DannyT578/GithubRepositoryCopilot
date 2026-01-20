'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Star, GitFork, Calendar, Code2, FolderOpen, FileCode } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function RepositoryInfo() {
  const { repository, isLoading } = useAppStore();
  const [repoData, setRepoData] = useState({
    stars: 0,
    forks: 0,
    language: 'TypeScript',
    lastUpdated: 'Recently',
    description: '',
  });

  useEffect(() => {
    // Simulate fetching repository data
    if (repository && !isLoading) {
      setTimeout(() => {
        setRepoData({
          stars: Math.floor(Math.random() * 100000),
          forks: Math.floor(Math.random() * 10000),
          language: 'TypeScript',
          lastUpdated: '2 days ago',
          description: 'A collection of beautiful components built with Radix UI and Tailwind CSS.',
        });
      }, 500);
    }
  }, [repository, isLoading]);

  // Mock file tree
  const fileTree = [
    {
      name: 'src',
      type: 'folder' as const,
      children: [
        { name: 'components', type: 'folder' as const },
        { name: 'lib', type: 'folder' as const },
        { name: 'app', type: 'folder' as const },
      ],
    },
    {
      name: 'public',
      type: 'folder' as const,
      children: [
        { name: 'images', type: 'folder' as const },
      ],
    },
    { name: 'package.json', type: 'file' as const },
    { name: 'README.md', type: 'file' as const },
    { name: 'tsconfig.json', type: 'file' as const },
  ];

  if (!repository) return null;

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-4 pr-4">
        {/* Repository Info */}
        <Card className="p-4 bg-card">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-1">{repository.name}</h3>
              <p className="text-xs text-muted-foreground">by {repository.owner}</p>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {repoData.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {repoData.stars.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <GitFork className="h-3 w-3" />
                    {repoData.forks.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Code2 className="h-3 w-3" />
                    {repoData.language}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {repoData.lastUpdated}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* File Structure */}
        {!isLoading && (
          <Card className="p-4 bg-card">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Repository Structure
            </h4>
            <Accordion type="single" collapsible className="w-full">
              {fileTree.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-none">
                  {item.type === 'folder' ? (
                    <>
                      <AccordionTrigger className="py-2 hover:no-underline hover:bg-muted/50 px-2 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-3.5 w-3.5 text-primary" />
                          <span>{item.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="ml-4 space-y-1">
                          {item.children?.map((child, childIndex) => (
                            <div
                              key={childIndex}
                              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer text-sm"
                            >
                              <FolderOpen className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{child.name}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 py-2 px-2 rounded hover:bg-muted/50 cursor-pointer text-sm">
                      <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{item.name}</span>
                    </div>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        )}

        {/* Processing Indicator */}
        {isLoading && (
          <Card className="p-4 bg-card">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">Processing repository...</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Analyzing code structure, issues, and discussions
              </p>
            </div>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}

