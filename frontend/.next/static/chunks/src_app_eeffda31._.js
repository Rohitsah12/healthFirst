(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/lib/axiosClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/store/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$authSlice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/store/authSlice.tsx [app-client] (ecmascript)");
;
;
;
const baseURL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: baseURL,
    withCredentials: true
});
api.interceptors.response.use((response)=>response, async (error)=>{
    var _error_response;
    const originalRequest = error.config;
    if (((_error_response = error.response) === null || _error_response === void 0 ? void 0 : _error_response.status) === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("".concat(baseURL, "/auth/refresh-token"), {}, {
                withCredentials: true
            });
            return api(originalRequest);
        } catch (refreshError) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"].dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$authSlice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logoutUser"])());
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/store/authSlice.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkAuthStatus",
    ()=>checkAuthStatus,
    "default",
    ()=>__TURBOPACK__default__export__,
    "loginUser",
    ()=>loginUser,
    "logoutUser",
    ()=>logoutUser,
    "resetAuth",
    ()=>resetAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/axiosClient.ts [app-client] (ecmascript)");
;
;
const loginUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('auth/login', async (credentials, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/login', credentials);
        return response.data.data;
    } catch (error) {
        var _err_response_data, _err_response;
        const err = error;
        return rejectWithValue(((_err_response = err.response) === null || _err_response === void 0 ? void 0 : (_err_response_data = _err_response.data) === null || _err_response_data === void 0 ? void 0 : _err_response_data.message) || 'Login failed');
    }
});
const logoutUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('auth/logout', async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/logout');
    } catch (error) {
        var _err_response_data, _err_response;
        const err = error;
        return rejectWithValue(((_err_response = err.response) === null || _err_response === void 0 ? void 0 : (_err_response_data = _err_response.data) === null || _err_response_data === void 0 ? void 0 : _err_response_data.message) || 'Logout failed');
    }
});
const checkAuthStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('auth/checkStatus', async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/auth/me');
        return response.data.data;
    } catch (error) {
        var _err_response_data, _err_response;
        const err = error;
        return rejectWithValue(((_err_response = err.response) === null || _err_response === void 0 ? void 0 : (_err_response_data = _err_response.data) === null || _err_response_data === void 0 ? void 0 : _err_response_data.message) || 'Not authenticated');
    }
});
const initialState = {
    user: null,
    isAuthenticated: false,
    role: null,
    status: 'idle',
    error: null
};
const authSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'auth',
    initialState,
    reducers: {
        // Add a manual reset action for immediate state clearing
        resetAuth: (state)=>{
            state.user = null;
            state.isAuthenticated = false;
            state.role = null;
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder)=>{
        builder.addCase(loginUser.pending, (state)=>{
            state.status = 'loading';
            state.error = null;
        }).addCase(loginUser.fulfilled, (state, action)=>{
            state.status = 'succeeded';
            state.isAuthenticated = true;
            state.role = action.payload.role;
        }).addCase(loginUser.rejected, (state, action)=>{
            state.status = 'failed';
            state.error = action.payload;
        }).addCase(logoutUser.pending, (state)=>{
            state.status = 'loading';
        }).addCase(logoutUser.fulfilled, (state)=>{
            state.isAuthenticated = false;
            state.user = null;
            state.role = null;
            state.status = 'succeeded'; // Changed from 'idle' to 'succeeded'
            state.error = null;
        }).addCase(logoutUser.rejected, (state)=>{
            // Even if logout fails, clear the auth state
            state.isAuthenticated = false;
            state.user = null;
            state.role = null;
            state.status = 'failed';
        }).addCase(checkAuthStatus.pending, (state)=>{
            state.status = 'loading';
        }).addCase(checkAuthStatus.fulfilled, (state, action)=>{
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.role = action.payload.user.role;
            state.status = 'succeeded';
            state.error = null;
        }).addCase(checkAuthStatus.rejected, (state)=>{
            state.isAuthenticated = false;
            state.user = null;
            state.role = null;
            state.status = 'succeeded'; // Changed from 'idle' to 'succeeded'
            state.error = null;
        });
    }
});
const { resetAuth } = authSlice.actions;
const __TURBOPACK__default__export__ = authSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/services/queueApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchQueue",
    ()=>fetchQueue,
    "updateStatus",
    ()=>updateStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/axiosClient.ts [app-client] (ecmascript)");
;
const fetchQueue = async ()=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/queue');
    return response.data.data;
};
const updateStatus = async (visitId, status)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch("/queue/".concat(visitId, "/status"), {
        status
    });
    return response.data.data;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/store/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PriorityLevel",
    ()=>PriorityLevel,
    "UserRole",
    ()=>UserRole,
    "VisitStatus",
    ()=>VisitStatus,
    "VisitType",
    ()=>VisitType
]);
var UserRole = /*#__PURE__*/ function(UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["STAFF"] = "STAFF";
    UserRole["DOCTOR"] = "DOCTOR";
    return UserRole;
}({});
var VisitStatus = /*#__PURE__*/ function(VisitStatus) {
    VisitStatus["SCHEDULED"] = "SCHEDULED";
    VisitStatus["CANCELLED"] = "CANCELLED";
    VisitStatus["CHECKED_IN"] = "CHECKED_IN";
    VisitStatus["WITH_DOCTOR"] = "WITH_DOCTOR";
    VisitStatus["COMPLETED"] = "COMPLETED";
    return VisitStatus;
}({});
var VisitType = /*#__PURE__*/ function(VisitType) {
    VisitType["SCHEDULED"] = "SCHEDULED";
    VisitType["WALK_IN"] = "WALK_IN";
    return VisitType;
}({});
var PriorityLevel = /*#__PURE__*/ function(PriorityLevel) {
    PriorityLevel["NORMAL"] = "NORMAL";
    PriorityLevel["URGENT"] = "URGENT";
    return PriorityLevel;
}({});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/store/queueSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "fetchQueueThunk",
    ()=>fetchQueueThunk,
    "updateStatusThunk",
    ()=>updateStatusThunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$services$2f$queueApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/services/queueApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/store/types.ts [app-client] (ecmascript)");
;
;
;
const fetchQueueThunk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('queue/fetch', async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$services$2f$queueApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchQueue"]();
    } catch (error) {
        const errorMessage = error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data ? error.response.data.message : 'Failed to update status';
        return rejectWithValue(errorMessage);
    }
});
const updateStatusThunk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('queue/updateStatus', async (param, param1)=>{
    let { visitId, status } = param, { rejectWithValue } = param1;
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$services$2f$queueApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateStatus"](visitId, status);
    } catch (error) {
        const errorMessage = error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data ? error.response.data.message : 'Failed to update status';
        return rejectWithValue(errorMessage);
    }
});
const initialState = {
    waiting: [],
    withDoctor: [],
    status: 'idle',
    error: null,
    movingVisitId: null
};
const queueSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'queue',
    initialState,
    reducers: {},
    extraReducers: (builder)=>{
        builder.addCase(fetchQueueThunk.pending, (state)=>{
            state.status = 'loading';
        }).addCase(fetchQueueThunk.fulfilled, (state, action)=>{
            state.status = 'succeeded';
            // Split the fetched queue into two lists for the UI
            state.waiting = action.payload.filter((v)=>v.currentStatus === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VisitStatus"].CHECKED_IN);
            state.withDoctor = action.payload.filter((v)=>v.currentStatus === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VisitStatus"].WITH_DOCTOR);
        }).addCase(fetchQueueThunk.rejected, (state, action)=>{
            state.status = 'failed';
            state.error = action.payload;
        })// Optimistic UI for status updates
        .addCase(updateStatusThunk.pending, (state, action)=>{
            state.movingVisitId = action.meta.arg.visitId; // Show spinner on the card being moved
        }).addCase(updateStatusThunk.fulfilled, (state, action)=>{
            state.movingVisitId = null;
            // Re-organize lists after a successful update
            const updatedVisit = action.payload;
            state.waiting = state.waiting.filter((v)=>v.id !== updatedVisit.id);
            state.withDoctor = state.withDoctor.filter((v)=>v.id !== updatedVisit.id);
            if (updatedVisit.currentStatus === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VisitStatus"].CHECKED_IN) {
                state.waiting.push(updatedVisit);
            } else if (updatedVisit.currentStatus === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VisitStatus"].WITH_DOCTOR) {
                state.withDoctor.push(updatedVisit);
            }
        }).addCase(updateStatusThunk.rejected, (state, action)=>{
            state.movingVisitId = null;
            state.error = action.payload;
        });
    }
});
const __TURBOPACK__default__export__ = queueSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/store/uiSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closeModal",
    ()=>closeModal,
    "default",
    ()=>__TURBOPACK__default__export__,
    "openModal",
    ()=>openModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
;
const initialState = {
    isModalOpen: false,
    modalType: null
};
const uiSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'ui',
    initialState,
    reducers: {
        openModal: (state, action)=>{
            state.isModalOpen = true;
            state.modalType = action.payload;
        },
        closeModal: (state)=>{
            state.isModalOpen = false;
            state.modalType = null;
        }
    }
});
const { openModal, closeModal } = uiSlice.actions;
const __TURBOPACK__default__export__ = uiSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/services/visitApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createVisit",
    ()=>createVisit,
    "exportVisitHistory",
    ()=>exportVisitHistory,
    "getVisitHistory",
    ()=>getVisitHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/lib/axiosClient.ts [app-client] (ecmascript)");
;
const createVisit = async (data)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/visits', data);
    return response.data.data;
};
const getVisitHistory = async (params)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/visits/history', {
        params
    });
    return response.data.data;
};
const exportVisitHistory = async (params)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$lib$2f$axiosClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/visits/history/export', {
        params,
        responseType: 'blob'
    });
    return response.data;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/store/visitHistorySlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "fetchVisitHistory",
    ()=>fetchVisitHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$services$2f$visitApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/services/visitApi.ts [app-client] (ecmascript)");
;
;
function isAxiosErrorType(error) {
    return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}
const fetchVisitHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])('visitHistory/fetch', async (params, param)=>{
    let { rejectWithValue } = param;
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$services$2f$visitApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVisitHistory"])(params);
        return data;
    } catch (error) {
        if (isAxiosErrorType(error) && error.response) {
            var _error_response_data;
            return rejectWithValue(((_error_response_data = error.response.data) === null || _error_response_data === void 0 ? void 0 : _error_response_data.message) || 'An API error occurred');
        }
        return rejectWithValue('An unexpected error occurred');
    }
});
const initialState = {
    visits: [],
    summary: null,
    status: 'idle',
    error: null
};
const visitHistorySlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'visitHistory',
    initialState,
    reducers: {},
    extraReducers: (builder)=>{
        builder.addCase(fetchVisitHistory.pending, (state)=>{
            state.status = 'loading';
            state.error = null;
        }).addCase(fetchVisitHistory.fulfilled, (state, action)=>{
            state.status = 'succeeded';
            state.visits = action.payload.visits;
            state.summary = action.payload.summary;
        }).addCase(fetchVisitHistory.rejected, (state, action)=>{
            state.status = 'failed';
            state.error = action.payload;
        });
    }
});
const __TURBOPACK__default__export__ = visitHistorySlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/store/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "store",
    ()=>store,
    "useAppDispatch",
    ()=>useAppDispatch,
    "useAppSelector",
    ()=>useAppSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$authSlice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/store/authSlice.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$queueSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/store/queueSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$uiSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/store/uiSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$visitHistorySlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/store/visitHistorySlice.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["configureStore"])({
    reducer: {
        auth: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$authSlice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        queue: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$queueSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        ui: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$uiSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        visitHistory: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$visitHistorySlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    }
});
const useAppDispatch = ()=>{
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDispatch"])();
};
_s(useAppDispatch, "jI3HA1r1Cumjdbu14H7G+TUj798=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDispatch"]
    ];
});
const useAppSelector = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSelector"];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/StoreProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreProvider",
    ()=>StoreProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/store/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$authSlice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/store/authSlice.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function AuthInitializer(param) {
    let { children } = param;
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthInitializer.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"].dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$authSlice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkAuthStatus"])());
        }
    }["AuthInitializer.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(AuthInitializer, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = AuthInitializer;
function StoreProvider(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"], {
        store: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"],
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthInitializer, {
            children: children
        }, void 0, false, {
            fileName: "[project]/src/app/StoreProvider.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/StoreProvider.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_c1 = StoreProvider;
var _c, _c1;
__turbopack_context__.k.register(_c, "AuthInitializer");
__turbopack_context__.k.register(_c1, "StoreProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_eeffda31._.js.map