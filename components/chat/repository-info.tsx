'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, GitFork, Calendar, Code2, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getRepoInfo, type RepoMeta } from '@/lib/api';

export function RepositoryInfo() {
  const { repository, isLoading } = useAppStore();
  const [meta, setMeta] = useState<RepoMeta | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!repository || isLoading) return;
    setFetching(true);
    getRepoInfo(repository.owner, repository.name)
      .then(setMeta)
      .catch(() => setMeta(null))
      .finally(() => setFetching(false));
  }, [repository, isLoading]);

  if (!repository) return null;

  const loading = isLoading || fetching;

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

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : meta ? (
              <>
                {meta.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {meta.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {meta.stars.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <GitFork className="h-3 w-3" />
                    {meta.forks.toLocaleString()}
                  </Badge>
                  {meta.language && (
                    <Badge variant="secondary" className="gap-1">
                      <Code2 className="h-3 w-3" />
                      {meta.language}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {new Date(meta.updated_at).toLocaleDateString()}</span>
                </div>

                <a
                  href={meta.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline pt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on GitHub
                </a>
              </>
            ) : null}
          </div>
        </Card>

        {/* Processing Indicator */}
        {loading && (
          <Card className="p-4 bg-card">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">Processing repositoryâ€¦</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ingesting code and building search index
              </p>
            </div>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
