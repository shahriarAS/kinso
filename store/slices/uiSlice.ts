import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "@/types";

interface UIState {
  loading: {
    [key: string]: boolean;
  };
  notifications: Notification[];
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  sidebar: {
    collapsed: boolean;
  };
  theme: {
    mode: "light" | "dark";
    primaryColor: string;
  };
}

const initialState: UIState = {
  loading: {},
  notifications: [],
  modals: {},
  sidebar: {
    collapsed: false,
  },
  theme: {
    mode: "light",
    primaryColor: "#181818",
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, "id" | "timestamp">>) => {
      const notification: Notification = {
        ...action.payload,
        _id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification._id !== action.payload
      );
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (notification) => notification._id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<{ key: string; data?: any }>) => {
      state.modals[action.payload.key] = {
        isOpen: true,
        data: action.payload.data,
      };
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
        state.modals[action.payload].data = undefined;
      }
    },
    toggleSidebar: (state) => {
      state.sidebar.collapsed = !state.sidebar.collapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.collapsed = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme.mode = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.theme.primaryColor = action.payload;
    },
  },
});

export const {
  setLoading,
  clearLoading,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  clearAllNotifications,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarCollapsed,
  setThemeMode,
  setPrimaryColor,
} = uiSlice.actions;

export default uiSlice.reducer; 