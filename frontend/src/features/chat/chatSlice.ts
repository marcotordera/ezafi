import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/store';
import { ChatMessage } from '@/types/ezafi';
import { askQuestionApi } from '@/api/client';

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  activeQueryStartTime: number | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  activeQueryStartTime: null,
};

export const sendQuestion = createAsyncThunk(
  'chat/sendQuestion',
  async (query: string, { rejectWithValue }) => {
    const startTime = performance.now();
    try {
      const response = await askQuestionApi(query);
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        response,
        latencyMs,
      };
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to retrieve answer from sovereign LLM backend.';
      return rejectWithValue(message);
    }
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendQuestion.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.activeQueryStartTime = Date.now();
        // Add user's question to the chat immediately
        state.messages.push({
          id: `user-${Date.now()}`,
          role: 'user',
          content: action.meta.arg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      })
      .addCase(sendQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeQueryStartTime = null;
        const { response, latencyMs } = action.payload;
        // Append assistant's answer
        state.messages.push({
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: response.model,
          citations: response.citations,
          latencyMs,
        });
      })
      .addCase(sendQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.activeQueryStartTime = null;
        state.error = action.payload as string;
      });
  },
});

export const { addMessage, clearMessages } = chatSlice.actions;

export const selectMessages = (state: RootState) => state.chat.messages;
export const selectIsLoading = (state: RootState) => state.chat.isLoading;
export const selectError = (state: RootState) => state.chat.error;

export default chatSlice.reducer;
