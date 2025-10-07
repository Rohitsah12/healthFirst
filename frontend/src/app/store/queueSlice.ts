import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as queueApi from '../services/queueApi';
import { Visit, VisitStatus } from './types'; 

interface QueueState {
  waiting: Visit[];
  withDoctor: Visit[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | unknown;
  movingVisitId: string | null; // To show a spinner on a specific card
}

export const fetchQueueThunk = createAsyncThunk<Visit[]>('queue/fetch', async (_, { rejectWithValue }) => {
  try {
    return await queueApi.fetchQueue();
  } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && 
        typeof error.response.data === 'object' && error.response.data !== null &&
        'message' in error.response.data
        ? (error.response.data as { message: string }).message
        : 'Failed to update status';
      return rejectWithValue(errorMessage);
    }
});

export const updateStatusThunk = createAsyncThunk<Visit, { visitId: string, status: VisitStatus }>(
  'queue/updateStatus',
  async ({ visitId, status }, { rejectWithValue }) => {
    try {
      return await queueApi.updateStatus(visitId, status);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && 
        typeof error.response.data === 'object' && error.response.data !== null &&
        'message' in error.response.data
        ? (error.response.data as { message: string }).message
        : 'Failed to update status';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState: QueueState = {
  waiting: [],
  withDoctor: [],
  status: 'idle',
  error: null,
  movingVisitId: null,
};

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQueueThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQueueThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Split the fetched queue into two lists for the UI
        state.waiting = action.payload.filter(v => v.currentStatus === VisitStatus.CHECKED_IN);
        state.withDoctor = action.payload.filter(v => v.currentStatus === VisitStatus.WITH_DOCTOR);
      })
      .addCase(fetchQueueThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Optimistic UI for status updates
      .addCase(updateStatusThunk.pending, (state, action) => {
        state.movingVisitId = action.meta.arg.visitId; // Show spinner on the card being moved
      })
      .addCase(updateStatusThunk.fulfilled, (state, action) => {
        state.movingVisitId = null;
        // Re-organize lists after a successful update
        const updatedVisit = action.payload;
        state.waiting = state.waiting.filter(v => v.id !== updatedVisit.id);
        state.withDoctor = state.withDoctor.filter(v => v.id !== updatedVisit.id);

        if (updatedVisit.currentStatus === VisitStatus.CHECKED_IN) {
            state.waiting.push(updatedVisit);
        } else if (updatedVisit.currentStatus === VisitStatus.WITH_DOCTOR) {
            state.withDoctor.push(updatedVisit);
        }
      })
      .addCase(updateStatusThunk.rejected, (state, action) => {
        state.movingVisitId = null;
        state.error = action.payload;
      });
  },
});

export default queueSlice.reducer;