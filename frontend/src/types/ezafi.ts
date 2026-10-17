export interface Citation {
  source: string;
  page: number | string;
  score: number;
  text: string;
}

export interface HealthResponse {
  status: string;
  ollama_reachable: boolean;
  db_chunk_count: number;
  default_model: string;
}

export interface DocumentInfo {
  filename: string;
  publication: string;
  chunk_count: number;
  page_count: number;
  on_disk: boolean;
}

export interface DocumentsResponse {
  total_chunks: number;
  documents: DocumentInfo[];
  unindexed_on_disk: string[];
}

export interface AskRequest {
  query: string;
}

export interface AskResponse {
  query: string;
  model: string;
  answer: string;
  citations: Citation[];
  chunks_used: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  citations?: Citation[];
  latencyMs?: number;
}
