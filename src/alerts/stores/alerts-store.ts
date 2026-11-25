import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Alert } from "../model/alert";
import { alertsService } from "../services/alerts-service";

interface AlertsState {
  alerts: Alert[];
  loading: boolean;

  // Toast notifications (corner pop-ups for newly arrived alerts).
  seenIds: number[]; // alert ids already known — never re-toasted
  toasts: Alert[]; // queue currently shown in the corner
  initialized: boolean; // baseline taken? avoids toasting pre-existing alerts

  fetchAlerts: (userId: number) => Promise<void>;
  pollAlerts: (userId: number) => Promise<void>;
  markAsRead: (alertId: number) => Promise<void>;
  dismissToast: (alertId: number) => void;
  dismissAllToasts: () => void;
}

export const useAlertsStore = create(
  immer<AlertsState>((set) => ({
    alerts: [],
    loading: false,
    seenIds: [],
    toasts: [],
    initialized: false,

    fetchAlerts: async (userId) => {
      set((state) => {
        state.loading = true;
      });
      try {
        const res = await alertsService.getAlertsByUserId(userId);
        if (res.data)
          set((state) => {
            state.alerts = res.data.map((a) => new Alert(a));
          });
      } catch {
        set((state) => {
          state.alerts = [];
        });
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },

    // Polled silently in the background. Detects alerts that appeared since the
    // baseline and pushes them as corner toasts. The first call only takes the
    // baseline — it never toasts alerts that already existed when you logged in.
    pollAlerts: async (userId) => {
      try {
        const res = await alertsService.getAlertsByUserId(userId);
        if (!res.data) return;
        const fresh = res.data.map((a) => new Alert(a));

        set((state) => {
          state.alerts = fresh;

          if (!state.initialized) {
            // Baseline: remember everything, toast nothing.
            state.seenIds = fresh.map((a) => a.id);
            state.initialized = true;
            return;
          }

          const incoming = fresh.filter(
            (a) => a.isUnread && !state.seenIds.includes(a.id),
          );
          for (const a of incoming) {
            state.toasts.push(a);
            state.seenIds.push(a.id);
          }
          // Cap the toast queue to at most 3 to avoid flooding the screen
          if (state.toasts.length > 3) {
            state.toasts = state.toasts.slice(-3);
          }
        });
      } catch (error) {
        console.error(error);
      }
    },

    markAsRead: async (alertId) => {
      try {
        const res = await alertsService.markAsRead(alertId);
        if (res.data) {
          set((state) => {
            const idx = state.alerts.findIndex((a) => a.id === alertId);
            if (idx !== -1) state.alerts[idx] = new Alert(res.data);
          });
        }
      } catch (error) {
        console.error(error);
      }
    },

    dismissToast: (alertId) => {
      set((state) => {
        state.toasts = state.toasts.filter((t) => t.id !== alertId);
      });
    },

    dismissAllToasts: () => {
      set((state) => {
        state.toasts = [];
      });
    },
  })),
);
