import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getVisitHistory, VisitHistoryQuery, VisitHistoryResponse } from '../services/visitApi';
import { Visit } from './types';
import axios from 'axios';

function isAxiosErrorType(error: unknown): error is { isAxiosError: boolean; response?: { data?: { message?: string } } } {
    return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}


interface VisitHistoryState {
    visits: Visit[];
    summary: VisitHistoryResponse['summary'] | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null | unknown;
}

export const fetchVisitHistory = createAsyncThunk<
    VisitHistoryResponse,
    VisitHistoryQuery,
    { rejectValue: string }
>(
    'visitHistory/fetch',
    async (params, { rejectWithValue }) => {
        try {
            const data = await getVisitHistory(params);
            return data;
        } catch (error: unknown) {
            if (isAxiosErrorType(error) && error.response) {
                return rejectWithValue(error.response.data?.message || 'An API error occurred');
            }
            return rejectWithValue('An unexpected error occurred');
        }


    }
);

const initialState: VisitHistoryState = {
    visits: [],
    summary: null,
    status: 'idle',
    error: null,
};

const visitHistorySlice = createSlice({
    name: 'visitHistory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVisitHistory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchVisitHistory.fulfilled, (state, action: PayloadAction<VisitHistoryResponse>) => {
                state.status = 'succeeded';
                state.visits = action.payload.visits;
                state.summary = action.payload.summary;
            })
            .addCase(fetchVisitHistory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default visitHistorySlice.reducer;