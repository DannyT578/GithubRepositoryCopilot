/**
 * Backend API client
 * Wraps all calls to the FastAPI backend. The GitHub access token obtained
 * from the Appwrite session is sent as an Authorization: Bearer header.
 * Call setApiToken() once you have the token from account.getSession().
 */

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

let _token: string | null = null;

/** Store the GitHub access token obtained from the Appwrite session. */
export function setApiToken(token: string | null): void {
  _token = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  let res: Response;
  try {
    res = await fetch(`${BACKEND}${path}`, { ...init, headers });
  } catch (e) {
    // Network-level failure: server unreachable, CORS preflight blocked, etc.
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[api] fetch ${path} network error:`, e);
    throw new ApiError(0, `Cannot reach backend (${msg}). Is the server running on ${BACKEND}?`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

/** Returns the logged-in user or null if not authenticated. */
export async function getMe(): Promise<GitHubUser | null> {
  try {
    return await request<GitHubUser>('/auth/me');
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Repositories
// ---------------------------------------------------------------------------
export interface RepoMeta {
  owner: string;
  repo: string;
  full_name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  updated_at: string;
  html_url: string;
  chunks?: number;
  indexed?: boolean;
  cached?: boolean;
}

export async function ingestRepo(
  repoUrl: string,
  chatModel: string,
  chatApiKey: string,
  embedApiKey: string = '',
): Promise<RepoMeta> {
  return request<RepoMeta>('/repos/ingest', {
    method: 'POST',
    body: JSON.stringify({ repo_url: repoUrl, chat_model: chatModel, chat_api_key: chatApiKey, embed_api_key: embedApiKey }),
  });
}

export async function getRepoInfo(owner: string, repo: string): Promise<RepoMeta> {
  return request<RepoMeta>(`/repos/${owner}/${repo}`);
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------
export interface ChatSource {
  type: 'code' | 'issue' | 'discussion';
  file?: string;
  lineStart?: number;
  lineEnd?: number;
  snippet?: string;
  title?: string;
  url?: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  owner: string,
  repo: string,
  question: string,
  history: HistoryMessage[],
  chatModel: string,
  chatApiKey: string,
  embedApiKey: string = '',
): Promise<ChatResponse> {
  return request<ChatResponse>(`/repos/${owner}/${repo}/chat`, {
    method: 'POST',
    body: JSON.stringify({ question, history, chat_model: chatModel, chat_api_key: chatApiKey, embed_api_key: embedApiKey }),
  });
}
