import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/store';
import { HealthResponse, DocumentInfo } from '@/types/ezafi';
import { fetchHealthApi, fetchDocumentsApi } from '@/api/client';

export interface SystemState {
  health: HealthResponse | null;
  documents: DocumentInfo[];
  totalChunks: number;
  isDownloadModalOpen: boolean;
  isFetchingSystemData: boolean;
}

const initialState: SystemState = {
  health: null,
  documents: [],
  totalChunks: 0,
  isDownloadModalOpen: false,
  isFetchingSystemData: false,
};

export const loadSystemData = createAsyncThunk(
  'system/loadSystemData',
  async (_, { rejectWithValue }) => {
    try {
      const [health, docsData] = await Promise.allSettled([
        fetchHealthApi(),
        fetchDocumentsApi(),
      ]);

      return {
        health: health.status === 'fulfilled' ? health.value : null,
        documents: docsData.status === 'fulfilled' ? docsData.value.documents : [],
        totalChunks: docsData.status === 'fulfilled' ? docsData.value.total_chunks : 0,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load system telemetry');
    }
  }
);

export const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setDownloadModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDownloadModalOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSystemData.pending, (state) => {
        state.isFetchingSystemData = true;
      })
      .addCase(loadSystemData.fulfilled, (state, action) => {
        state.isFetchingSystemData = false;
        state.health = action.payload.health;
        state.documents = action.payload.documents;
        state.totalChunks = action.payload.totalChunks;
      })
      .addCase(loadSystemData.rejected, (state) => {
        state.isFetchingSystemData = false;
      });
  },
});

export const { setDownloadModalOpen } = systemSlice.actions;

export const selectHealth = (state: RootState) => state.system.health;
export const selectDocuments = (state: RootState) => state.system.documents;
export const selectIsDownloadModalOpen = (state: RootState) => state.system.isDownloadModalOpen;

export default systemSlice.reducer;
