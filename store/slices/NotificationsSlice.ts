import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AppNotification = {
  id: string;
  order_id?: string;
  order_status?: string;
  title: string;
  body: string;
  icon: string;
  read: boolean;
  created_at?: string;
};

type NotificationsState = {
  items: AppNotification[];
};

const initialState: NotificationsState = {
  items: [],
};

const NotificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, { payload }: PayloadAction<AppNotification[]>) => {
      state.items = payload;
    },
    prependNotification: (
      state,
      { payload }: PayloadAction<AppNotification>,
    ) => {
      if (!payload?.id) {
        return;
      }
      const exists = state.items.some((item) => item.id === payload.id);
      if (exists) {
        return;
      }
      state.items = [payload, ...state.items];
    },
    markNotificationRead: (state, { payload }: PayloadAction<string>) => {
      state.items = state.items.map((item) =>
        item.id === payload ? { ...item, read: true } : item,
      );
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const {
  setNotifications,
  prependNotification,
  markNotificationRead,
  clearNotifications,
} = NotificationsSlice.actions;

export default NotificationsSlice.reducer;
