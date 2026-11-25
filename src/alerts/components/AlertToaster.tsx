import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Slide from "@mui/material/Slide";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  X as CloseIcon,
  ChevronRight,
} from "lucide-react";
import { useAlertsStore } from "../stores/alerts-store";
import { useGlobalStore } from "../../shared/stores/global-store";
import type { Alert } from "../model/alert";

const POLL_INTERVAL_MS = 5_000;
const AUTO_DISMISS_MS = 5_000;

function ToastItem({ alert, onView }: { alert: Alert; onView: () => void }) {
  const dismissToast = useAlertsStore((state) => state.dismissToast);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      dismissToast(alert.id);
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [alert.id, dismissToast, isPaused]);

  const isRed = alert.isRed;
  const isYellow = alert.isYellow;

  const accentBorder = isRed
    ? "border-l-4 border-l-red-500 border-red-200"
    : isYellow
    ? "border-l-4 border-l-amber-500 border-amber-200"
    : "border-l-4 border-l-emerald-500 border-emerald-200";

  const badgeClass = isRed
    ? "bg-red-100 text-red-700 border-red-200"
    : isYellow
    ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-emerald-100 text-emerald-800 border-emerald-200";

  const icon = isRed ? (
    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
  ) : isYellow ? (
    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
  ) : (
    <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
  );

  return (
    <Slide in direction="left" mountOnEnter unmountOnExit>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`pointer-events-auto w-[310px] max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border transition-all duration-200 hover:shadow-xl hover:bg-white ${accentBorder}`}
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-gray-900 truncate">
                {alert.alertTypeLabel}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${badgeClass}`}
              >
                {isRed ? "Crítica" : isYellow ? "Aviso" : "Info"}
              </span>
            </div>
            <p className="text-[12px] text-gray-600 line-clamp-2 mt-1 leading-snug">
              {alert.message}
            </p>
            <div className="flex items-center justify-end gap-2 mt-2 pt-1 border-t border-gray-100">
              <button
                onClick={onView}
                className="text-[11px] font-semibold text-[#10A065] hover:text-[#0A7E4D] hover:underline flex items-center gap-0.5 transition-colors"
              >
                <span>Ver alertas</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
          <button
            onClick={() => dismissToast(alert.id)}
            className="text-gray-400 hover:text-gray-700 p-0.5 rounded-md hover:bg-gray-100 transition-colors shrink-0"
            title="Cerrar notificación"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </div>
    </Slide>
  );
}

// Global background poller + corner notifications. Mounted once in MainLayout so
// it lives across every private route. Polls the alerts endpoint every 5s and
// pops a compact toast (bottom-right) for newly arriving alerts, capped at 3 max.
export function AlertToaster() {
  const navigate = useNavigate();
  const info = useGlobalStore((state) => state.info);
  const fetchInfo = useGlobalStore((state) => state.fetchInfo);
  const toasts = useAlertsStore((state) => state.toasts);
  const pollAlerts = useAlertsStore((state) => state.pollAlerts);
  const dismissAllToasts = useAlertsStore((state) => state.dismissAllToasts);

  // After a page refresh the profile may not be loaded yet — fetch it so we
  // have the userId the poller needs.
  useEffect(() => {
    if (!info?.id) fetchInfo();
  }, [info?.id, fetchInfo]);

  useEffect(() => {
    if (!info?.id) return;
    pollAlerts(info.id);
    const id = setInterval(() => pollAlerts(info.id!), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [info?.id, pollAlerts]);

  if (toasts.length === 0) return null;

  // Max 3 toasts displayed at once
  const visibleToasts = toasts.slice(-3);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {toasts.length > 1 && (
        <button
          onClick={dismissAllToasts}
          className="pointer-events-auto text-[11px] font-medium text-gray-600 hover:text-gray-900 bg-white/95 hover:bg-white backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-gray-200 transition-all flex items-center gap-1.5 hover:shadow-md mb-0.5"
          title="Cerrar todas las notificaciones"
        >
          <span>Descartar todas ({toasts.length})</span>
          <CloseIcon size={12} />
        </button>
      )}
      {visibleToasts.map((alert) => (
        <ToastItem
          key={alert.id}
          alert={alert}
          onView={() => navigate("/alerts")}
        />
      ))}
    </div>
  );
}
