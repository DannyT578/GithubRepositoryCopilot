'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, MessageSquare, Code, GitBranch, Sparkles, ArrowRight, LogOut, Loader2, KeyRound, Bot, AlertCircle, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getMe, setApiToken, ingestRepo, ApiError } from '@/lib/api';
import { account, OAuthProvider } from '@/lib/appwrite';

// ---------------------------------------------------------------------------
// Provider / model configuration
// ---------------------------------------------------------------------------
type Provider = 'openai' | 'google' | 'anthropic';

const PROVIDER_MODELS: Record<Provider, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-5.4-mini', label: 'GPT-5.4 Mini' },
    { value: 'gpt-5.4-nano', label: 'GPT-5.4 Nano' },
  ],
  google: [
    { value: 'gemini/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini/gemini-3', label: 'Gemini 3' },
  ],
  anthropic: [
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    { value: 'claude-sonnet4-6', label: 'Claude Sonnet 4.6' },
    { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  ],
};

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  google: 'Google Gemini',
  anthropic: 'Anthropic',
};

const KEY_PLACEHOLDERS: Record<Provider, string> = {
  openai: 'OpenAI API key (sk-...)',
  google: 'Google AI Studio key (AIza...)',
  anthropic: 'Anthropic API key (sk-ant-...)',
};

function providerFromModel(model: string): Provider {
  if (model.startsWith('gemini') || model.includes('gemini/')) return 'google';
  if (model.startsWith('claude')) return 'anthropic';
  return 'openai';
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Legacy catch-all
  auth_failed:
    'GitHub sign-in failed. Your session could not be verified — this can happen if the OAuth flow was interrupted or your token expired. Please try signing in again.',
  // Specific failure codes (see auth/callback/page.tsx)
  session_failed:
    'Appwrite could not create or retrieve a session. Check that your Appwrite project ID and endpoint in .env.local are correct, and that the GitHub OAuth provider is enabled in your Appwrite project.',
  no_token:
    'GitHub sign-in succeeded but Appwrite returned no access token. In your Appwrite project, go to Auth → GitHub provider and ensure the "repo" and "read:user" scopes are saved, then try again.',
  backend_failed:
    `Signed in with GitHub but the backend could not be reached. Make sure the FastAPI server is running on ${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'} and FRONTEND_URL in the backend environment matches this origin.`,
};

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [provider, setProvider] = useState<Provider>('openai');
  const router = useRouter();
  const {
    setRepository, setIsLoading, user, setUser, authChecked, setAuthChecked,
    chatModel, setChatModel, chatApiKey, setChatApiKey, embedApiKey, setEmbedApiKey,
  } = useAppStore();

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setChatModel(PROVIDER_MODELS[newProvider][0].value);
  };

  // Read ?error param from the auth callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get('error');
    if (errParam) {
      setAuthError(AUTH_ERROR_MESSAGES[errParam] ?? 'An unexpected authentication error occurred. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleLogin = () => {
    account.createOAuth2Session(
      OAuthProvider.Github,
      `${window.location.origin}/auth/callback`,
      `${window.location.origin}/`,
      ['repo', 'read:user'],
    );
  };

  // Restore Appwrite session on mount
  useEffect(() => {
    if (authChecked) return;
    account
      .getSession('current')
      .then(async (session) => {
        const token = session.providerAccessToken;
        if (!token) throw new Error('No token');
        setApiToken(token);
        const u = await getMe();
        setUser(u);
        setAuthChecked(true);
      })
      .catch(() => { setUser(null); setAuthChecked(true); });
  }, [authChecked, setUser, setAuthChecked]);

  const validateGithubUrl = (url: string): boolean => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubRegex.test(url.trim());
  };

  const handleAnalyze = async () => {
    setError('');

    if (!user) {
      handleLogin();
      return;
    }

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!validateGithubUrl(repoUrl)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    if (!chatApiKey.trim()) {
      setError(`Please enter your ${PROVIDER_LABELS[provider]} API key`);
      return;
    }

    if (provider === 'anthropic' && !embedApiKey.trim()) {
      setError('Anthropic needs a separate OpenAI API key for embeddings. Please enter it below.');
      return;
    }

    const urlParts = repoUrl.trim().replace(/\/$/, '').split('/');
    const owner = urlParts[urlParts.length - 2];
    const name = urlParts[urlParts.length - 1];

    setIngesting(true);
    setIsLoading(true);

    try {
      const meta = await ingestRepo(repoUrl.trim(), chatModel, chatApiKey.trim(), embedApiKey.trim());

      setRepository({
        url: repoUrl.trim(),
        name: meta.repo,
        owner: meta.owner,
        description: meta.description ?? undefined,
        stars: meta.stars,
        forks: meta.forks,
        language: meta.language ?? undefined,
        lastUpdated: meta.updated_at,
      });

      router.push('/chat');
    } catch (e) {
      setIsLoading(false);
      if (e instanceof ApiError) {
        const messages: Record<string, string> = {
          'error:repo_not_found': 'Repository not found or you don\'t have access to it.',
          'error:repo_too_large': 'Repository is too large (exceeds 750K tokens).',
          'error:repo_private': 'Repository is private or the GitHub API rate limit was exceeded.',
        };
        setError(messages[e.message] ?? e.message);
      } else {
        setError('Unexpected error. Please try again.');
      }
    } finally {
      setIngesting(false);
    }
  };

  const handleLogout = async () => {
    await account.deleteSession('current').catch(() => {});
    setApiToken(null);
    setUser(null);
    setAuthChecked(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Auth error banner */}
      {authError && (
        <div className="flex items-start gap-3 px-5 py-3 bg-destructive/10 border-b border-destructive/30 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{authError}</span>
          <button
            onClick={() => setAuthError(null)}
            aria-label="Dismiss"
            className="flex-shrink-0 rounded p-0.5 hover:bg-destructive/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Github className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Chat with GitHub</span>
          </div>

          {/* Auth area */}
          {authChecked && (
            user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.login} />
                  <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">{user.login}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin} variant="outline" size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                Sign in with GitHub
              </Button>
            )
          )}
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
            {!user && authChecked ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Sign in with GitHub to analyze public and private repositories you have access to.</p>
                <Button onClick={handleLogin} size="lg" className="gap-2">
                  <Github className="h-5 w-5" />
                  Sign in with GitHub
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Row 1: URL + Analyze button */}
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
                      disabled={ingesting}
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyze}
                    size="lg"
                    className="h-12 px-8 shadow-md hover:shadow-lg transition-all"
                    disabled={ingesting}
                  >
                    {ingesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ingesting…
                      </>
                    ) : (
                      <>
                        Analyze Repository
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Row 2: Provider + Model selectors */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      value={provider}
                      onChange={(e) => handleProviderChange(e.target.value as Provider)}
                      className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={ingesting}
                      aria-label="AI provider"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="google">Google Gemini</option>
                      <option value="anthropic">Anthropic</option>
                    </select>
                  </div>
                  <select
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value)}
                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={ingesting}
                    aria-label="AI model"
                  >
                    {PROVIDER_MODELS[provider].map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Row 3: API key for selected provider */}
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={KEY_PLACEHOLDERS[provider]}
                    value={chatApiKey}
                    onChange={(e) => {
                      setChatApiKey(e.target.value);
                      setError('');
                    }}
                    className="h-10 pl-9 text-sm font-mono"
                    aria-label={`${PROVIDER_LABELS[provider]} API key`}
                    disabled={ingesting}
                  />
                </div>

                {/* Row 4: Embed key (Anthropic only — needs OpenAI for embeddings) */}
                {provider === 'anthropic' && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground pl-1">
                      Anthropic doesn’t support embeddings. An OpenAI key is required to build the search index.
                    </p>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="OpenAI API key for embeddings (sk-...)"
                        value={embedApiKey}
                        onChange={(e) => {
                          setEmbedApiKey(e.target.value);
                          setError('');
                        }}
                        className="h-10 pl-9 text-sm font-mono"
                        aria-label="OpenAI embeddings API key"
                        disabled={ingesting}
                      />
                    </div>
                  </div>
                )}
                
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
                      disabled={ingesting}
                    >
                      {example.split('/').slice(-2).join('/')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="p-6 border-border/50 bg-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 duration-300 animate-in fade-in slide-in-from-bottom-4 delay-300">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Code Understanding</h3>
              <p className="text-sm text-muted-foreground">Instantly navigate and understand complex codebases with AI-powered explanations.</p>
            </Card>
            <Card className="p-6 border-border/50 bg-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 duration-300 animate-in fade-in slide-in-from-bottom-4 delay-500">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Natural Conversation</h3>
              <p className="text-sm text-muted-foreground">Ask questions in plain English and get accurate, context-aware answers.</p>
            </Card>
            <Card className="p-6 border-border/50 bg-card/80 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 duration-300 animate-in fade-in slide-in-from-bottom-4 delay-700">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Private Repos</h3>
              <p className="text-sm text-muted-foreground">Authenticate with GitHub to access private repositories you own or collaborate on.</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
