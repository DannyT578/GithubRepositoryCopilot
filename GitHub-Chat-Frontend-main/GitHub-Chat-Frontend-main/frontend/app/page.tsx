'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Github, MessageSquare, Code, GitBranch, Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setRepository, setIsLoading } = useAppStore();

  const validateGithubUrl = (url: string): boolean => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubRegex.test(url.trim());
  };

  const handleAnalyze = async () => {
    setError('');
    
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!validateGithubUrl(repoUrl)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    // Extract owner and repo name from URL
    const urlParts = repoUrl.trim().replace(/\/$/, '').split('/');
    const owner = urlParts[urlParts.length - 2];
    const name = urlParts[urlParts.length - 1];

    // Set repository data (in real app, this would come from backend)
    setRepository({
      url: repoUrl.trim(),
      name,
      owner,
    });

    setIsLoading(true);
    
    // Navigate to chat page
    router.push('/chat');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Github className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Chat with GitHub</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="text-center space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-top-2 duration-700">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Large Language Models</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Understand GitHub Repositories
              <span className="block mt-2 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                with AI Assistance
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Navigate and comprehend any GitHub repository instantly. Ask questions about code, 
              issues, and discussions — all in one intelligent conversation.
            </p>
          </div>

          {/* URL Input Card */}
          <Card className="p-8 shadow-lg shadow-primary/5 border-border/50 bg-card/80 backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="https://github.com/owner/repository"
                    value={repoUrl}
                    onChange={(e) => {
                      setRepoUrl(e.target.value);
                      setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    className="h-12 text-base"
                    aria-label="GitHub repository URL"
                  />
                </div>
                <Button 
                  onClick={handleAnalyze}
                  size="lg"
                  className="h-12 px-8 shadow-md hover:shadow-lg transition-all"
                >
                  Analyze Repository
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try examples:</span>
                {[
                  'https://github.com/shadcn-ui/ui',
                  'https://github.com/facebook/react',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setRepoUrl(example)}
                    className="text-sm px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {example.split('/').slice(-2).join('/')}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="p-6 border-border/50 bg-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 duration-300 animate-in fade-in slide-in-from-bottom-4 delay-300">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Understand Code</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions about functions, classes, and implementation details across multiple files.
              </p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 duration-300 animate-in fade-in slide-in-from-bottom-4 delay-500">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Explore Discussions</h3>
              <p className="text-sm text-muted-foreground">
                Get insights from issues and discussions to understand developer decisions and solutions.
              </p>
            </Card>

            <Card className="p-6 border-border/50 bg-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 duration-300 animate-in fade-in slide-in-from-bottom-4 delay-700">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Navigate Easily</h3>
              <p className="text-sm text-muted-foreground">
                Skip the manual browsing. Get direct answers with relevant code snippets and references.
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, shadcn/ui, and AI • Open Source</p>
        </div>
      </footer>
    </div>
  );
}
