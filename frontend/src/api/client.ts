import axios from 'axios';
import { AskResponse, HealthResponse, DocumentsResponse } from '@/types/ezafi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ezafi.marcotordera.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90s to allow for EC2 cold auto-wake and local model inference
});

export async function fetchHealthApi(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
}

export async function fetchDocumentsApi(): Promise<DocumentsResponse> {
  const response = await apiClient.get<DocumentsResponse>('/documents');
  return response.data;
}

export async function askQuestionApi(query: string): Promise<AskResponse> {
  const response = await apiClient.post<AskResponse>('/ask', { query });
  return response.data;
}

export function getDocumentDownloadUrl(filename: string): string {
  return `${API_BASE_URL}/documents/${encodeURIComponent(filename)}/download`;
}
