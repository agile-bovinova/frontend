import { AlertTriangle, AlertCircle, CheckCircle2, Check, Clock } from "lucide-react";
import dayjs from "dayjs";
import { useAuthStore } from "../../auth/store/auth-store";
import { canEdit } from "../../shared/utils/access-control";
import type { Alert } from "../model/alert";

interface Props {
    alert: Alert;
    bovineName?: string;
    bovineCode?: string;
    onMarkAsRead: (alertId: number) => void;
}

export function AlertCard({ alert, bovineName, bovineCode, onMarkAsRead }: Props) {
    const editable = useAuthStore((s) => canEdit(s.user));

    const isRed = alert.isRed;
    const isYellow = alert.isYellow;

    const borderColor = isRed
        ? "border-red-200 border-l-4 border-l-red-500"
        : isYellow
            ? "border-amber-200 border-l-4 border-l-amber-500"
            : "border-emerald-200 border-l-4 border-l-emerald-500";

    const bgColor = isRed
        ? alert.isUnread ? "bg-red-50/50" : "bg-white"
        : isYellow
            ? alert.isUnread ? "bg-amber-50/40" : "bg-white"
            : "bg-white";

    const UrgencyIcon = isRed
        ? AlertCircle
        : isYellow
            ? AlertTriangle
            : CheckCircle2;

    const iconColor = isRed
        ? "text-red-500"
        : isYellow
            ? "text-amber-500"
            : "text-emerald-500";

    const urgencyBadge = isRed ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            Crítica
        </span>
    ) : isYellow ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Advertencia
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Normal
        </span>
    );

    return (
        <div className={`rounded-[16px] border p-4 shadow-xs font-inter transition-all ${borderColor} ${bgColor} ${alert.isUnread ? "shadow-sm" : "opacity-80 hover:opacity-100"}`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isRed ? "bg-red-100" : isYellow ? "bg-amber-100" : "bg-emerald-100"
                    }`}>
                        <UrgencyIcon className={`w-5 h-5 ${iconColor}`} />
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {urgencyBadge}

                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#F4F8F2] text-[#4F6354] border border-[#E1E7DF]">
                                {alert.alertTypeLabel}
                            </span>

                            {alert.isUnread ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                                    No leída
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-500">
                                    Leída
                                </span>
                            )}
                        </div>

                        <p className="text-sm font-semibold text-[#0E1A12] leading-snug">
                            {alert.message}
                        </p>

                        <div className="flex items-center gap-2.5 text-xs text-[#7E8F82] flex-wrap mt-0.5">
                            {alert.isAccountLevel ? (
                                <span className="font-medium text-[#4F6354]">Alerta de Cuenta</span>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-[#1B5E20] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                                        🔔 {bovineCode || `BOV-${String(alert.bovineId).padStart(3, '0')}`}
                                    </span>
                                    {bovineName && (
                                        <span className="font-semibold text-[#0E1A12]">
                                            {bovineName}
                                        </span>
                                    )}
                                </div>
                            )}

                            <span>•</span>

                            <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Clock className="w-3 h-3" />
                                {dayjs(alert.createdAt).format("DD/MM/YYYY HH:mm")}
                            </span>
                        </div>
                    </div>
                </div>

                {alert.isUnread && editable && (
                    <button
                        onClick={() => onMarkAsRead(alert.id)}
                        className="cursor-pointer self-start sm:self-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold text-[#10A065] bg-[#C8F0DA]/60 hover:bg-[#C8F0DA] border border-[#10A065]/20 transition-all active:scale-95"
                        title="Marcar alerta como leída"
                    >
                        <Check className="w-3.5 h-3.5" />
                        <span>Marcar leída</span>
                    </button>
                )}
            </div>
        </div>
    );
}
