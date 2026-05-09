import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationService from '../../services/notificationService';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (filter, { rejectWithValue }) => {
        try {
            return await notificationService.getNotifications(filter, 1);
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Failed to fetch notifications' });
        }
    }
);

export const fetchMoreNotifications = createAsyncThunk(
    'notifications/fetchMoreNotifications',
    async (_, { getState, rejectWithValue }) => {
        const { activeFilter, pagination } = getState().notifications;
        try {
            return await notificationService.getNotifications(activeFilter, pagination.currentPage + 1);
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Failed to fetch more notifications' });
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            return await notificationService.getUnreadCount();
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Failed to fetch unread count' });
        }
    }
);

export const markNotificationRead = createAsyncThunk(
    'notifications/markNotificationRead',
    async (id, { rejectWithValue }) => {
        try {
            return await notificationService.markRead(id);
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Failed to mark notification as read' });
        }
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    'notifications/markAllNotificationsRead',
    async (_, { rejectWithValue }) => {
        try {
            return await notificationService.markAllRead();
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Failed to mark all notifications as read' });
        }
    }
);

export const removeNotification = createAsyncThunk(
    'notifications/removeNotification',
    async (id, { rejectWithValue }) => {
        try {
            await notificationService.deleteNotification(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Failed to delete notification' });
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
        activeFilter: 'all',
        pagination: {
            currentPage: 1,
            lastPage: 1,
            hasMore: true,
        },
        loading: false,
        loadingMore: false,
        error: null,
    },
    reducers: {
        setFilter: (state, action) => {
            state.activeFilter = action.payload;
            state.items = [];
            state.pagination = {
                currentPage: 1,
                lastPage: 1,
                hasMore: true,
            };
        },
        resetState: (state) => {
            state.items = [];
            state.unreadCount = 0;
            state.activeFilter = 'all';
            state.pagination = {
                currentPage: 1,
                lastPage: 1,
                hasMore: true,
            };
            state.loading = false;
            state.loadingMore = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchNotifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                const { notifications, unread_count } = action.payload;
                state.items = notifications.data;
                state.unreadCount = unread_count;
                state.pagination = {
                    currentPage: notifications.current_page,
                    lastPage: notifications.last_page,
                    hasMore: notifications.current_page < notifications.last_page,
                };
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchMoreNotifications
            .addCase(fetchMoreNotifications.pending, (state) => {
                state.loadingMore = true;
            })
            .addCase(fetchMoreNotifications.fulfilled, (state, action) => {
                state.loadingMore = false;
                const { notifications } = action.payload;
                state.items = [...state.items, ...notifications.data];
                state.pagination = {
                    currentPage: notifications.current_page,
                    lastPage: notifications.last_page,
                    hasMore: notifications.current_page < notifications.last_page,
                };
            })
            .addCase(fetchMoreNotifications.rejected, (state) => {
                state.loadingMore = false;
            })

            // fetchUnreadCount
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload.count;
            })

            // markNotificationRead (Optimistic)
            .addCase(markNotificationRead.pending, (state, action) => {
                const item = state.items.find(i => i.id === action.meta.arg);
                if (item && !item.is_read) {
                    item.is_read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })

            // markAllNotificationsRead (Optimistic)
            .addCase(markAllNotificationsRead.pending, (state) => {
                state.items.forEach(item => {
                    item.is_read = true;
                });
                state.unreadCount = 0;
            })

            // removeNotification (Optimistic)
            .addCase(removeNotification.pending, (state, action) => {
                const itemIndex = state.items.findIndex(i => i.id === action.meta.arg);
                if (itemIndex !== -1) {
                    if (!state.items[itemIndex].is_read) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                    state.items.splice(itemIndex, 1);
                }
            });
    },
});

export const { setFilter, resetState } = notificationSlice.actions;
export default notificationSlice.reducer;
