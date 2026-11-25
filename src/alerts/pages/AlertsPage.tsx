import { useEffect, useMemo, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Bell, Filter, ArrowUpDown, CheckCheck } from "lucide-react";
import { useAlertsStore } from "../stores/alerts-store";
import { AlertCard } from "../components/AlertCard";
import { useGlobalStore } from "../../shared/stores/global-store";

export function AlertsPage() {
    const { info, fetchInfo, animals, fetchAnimals } = useGlobalStore();
    const { alerts, loading, fetchAlerts, markAsRead } = useAlertsStore();

    // "all" shows every alert; otherwise filter to a single bovine.
    const [selectedBovineId, setSelectedBovineId] = useState<number | "all">("all");
    // Filter by urgency tab
    const [urgencyFilter, setUrgencyFilter] = useState<"all" | "unread" | "Red" | "Yellow">("all");
    // Sorting
    const [sortBy, setSortBy] = useState<"urgency" | "recent">("urgency");

    useEffect(() => {
        fetchInfo();
        fetchAnimals();
    }, []);

    useEffect(() => {
        if (info?.id) fetchAlerts(info.id);
    }, [info?.id]);

    // Lookup bovine by ID
    const bovineMap = useMemo(() => {
        const map = new Map<number, { name: string; code: string }>();
        animals.forEach(a => map.set(a.id, {
            name: a.name,
            code: a.code || `BOV-${String(a.id).padStart(3, '0')}`
        }));
        return map;
    }, [animals]);

    // Bovine options that have alerts
    const bovineOptions = useMemo(() => {
        const ids = Array.from(new Set(alerts.map(a => a.bovineId).filter((id): id is number => id !== null)));
        return ids
            .map(id => {
                const info = bovineMap.get(id);
                return {
                    id,
                    name: info?.name ?? `Bovino ${id}`,
                    code: info?.code ?? `BOV-${String(id).padStart(3, '0')}`
                };
            })
            .sort((a, b) => a.code.localeCompare(b.code));
    }, [alerts, bovineMap]);

    // Filter by bovine
    const bovineFiltered = selectedBovineId === "all"
        ? alerts
        : alerts.filter(a => a.bovineId === selectedBovineId);

    // Filter by status/urgency tab
    const filteredAlerts = bovineFiltered.filter(a => {
        if (urgencyFilter === "unread") return a.isUnread;
        if (urgencyFilter === "Red") return a.isRed;
        if (urgencyFilter === "Yellow") return a.isYellow;
        return true;
    });

    // Sorting
    const sortedAlerts = useMemo(() => {
        const rank = (level: string) => (level === "Red" ? 0 : level === "Yellow" ? 1 : 2);
        return [...filteredAlerts].sort((a, b) =>
            sortBy === "urgency"
                ? rank(a.urgencyLevel) - rank(b.urgencyLevel) || b.createdAt.localeCompare(a.createdAt)
                : b.createdAt.localeCompare(a.createdAt)
        );
    }, [filteredAlerts, sortBy]);

    const unreadCount = alerts.filter(a => a.isUnread).length;
    const redCount = alerts.filter(a => a.isRed).length;
    const yellowCount = alerts.filter(a => a.isYellow).length;

    return (
        <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full px-6 py-6 font-inter">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8F0DA] flex items-center justify-center text-[#10A065]">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-[24px] leading-[32px] text-[#0E1A12] font-semibold font-inter">
                            Alertas Sanitarias
                        </h1>
                        <p className="text-xs text-[#7E8F82] font-inter">
                            Detección temprana de anomalías biométricas y notificaciones del sistema
                        </p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        {unreadCount} alerta{unreadCount === 1 ? "" : "s"} sin leer
                    </span>
                )}
            </div>

            {/* Filter and Control Card */}
            <div className="bg-white rounded-[16px] border border-[#E1E7DF] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Quick filter pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setUrgencyFilter("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            urgencyFilter === "all"
                                ? "bg-[#10A065] text-white shadow-xs"
                                : "bg-[#F4F8F2] text-[#4F6354] hover:bg-[#E1E7DF]"
                        }`}
                    >
                        Todas ({alerts.length})
                    </button>
                    <button
                        onClick={() => setUrgencyFilter("unread")}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            urgencyFilter === "unread"
                                ? "bg-red-600 text-white shadow-xs"
                                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                        }`}
                    >
                        Sin leer ({unreadCount})
                    </button>
                    <button
                        onClick={() => setUrgencyFilter("Red")}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            urgencyFilter === "Red"
                                ? "bg-red-600 text-white shadow-xs"
                                : "bg-[#F4F8F2] text-[#4F6354] hover:bg-[#E1E7DF]"
                        }`}
                    >
                        Críticas ({redCount})
                    </button>
                    <button
                        onClick={() => setUrgencyFilter("Yellow")}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            urgencyFilter === "Yellow"
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-[#F4F8F2] text-[#4F6354] hover:bg-[#E1E7DF]"
                        }`}
                    >
                        Advertencias ({yellowCount})
                    </button>
                </div>

                {/* Dropdown Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#7E8F82]" />
                        <select
                            className="bg-[#F4F8F2] border border-[#E1E7DF] rounded-[10px] px-3 py-1.5 text-xs font-medium font-inter text-[#0E1A12] focus:outline-none focus:border-[#10A065]"
                            value={selectedBovineId}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedBovineId(val === "all" ? "all" : Number(val));
                            }}
                        >
                            <option value="all">Todos los bovinos</option>
                            {bovineOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.code} · {opt.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-[#7E8F82]" />
                        <select
                            className="bg-[#F4F8F2] border border-[#E1E7DF] rounded-[10px] px-3 py-1.5 text-xs font-medium font-inter text-[#0E1A12] focus:outline-none focus:border-[#10A065]"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "urgency" | "recent")}
                        >
                            <option value="urgency">Priorizar Criticidad</option>
                            <option value="recent">Más recientes primero</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <CircularProgress size={36} sx={{ color: "#10A065" }} />
                </div>
            )}

            {/* Empty state */}
            {!loading && sortedAlerts.length === 0 && (
                <div className="bg-white rounded-[16px] border border-[#E1E7DF] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs font-inter">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                        <CheckCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#0E1A12]">
                        No hay alertas para mostrar
                    </h3>
                    <p className="text-xs text-[#7E8F82] max-w-sm">
                        {selectedBovineId === "all"
                            ? "Todos los animales se encuentran con métricas estables dentro de los rangos biológicos normales."
                            : "Este bovino no cuenta con alertas sanitarias activas bajo el filtro seleccionado."}
                    </p>
                </div>
            )}

            {/* Alerts List */}
            {!loading && sortedAlerts.length > 0 && (
                <div className="flex flex-col gap-3">
                    {sortedAlerts.map((alert) => {
                        const bInfo = alert.bovineId !== null ? bovineMap.get(alert.bovineId) : undefined;
                        return (
                            <AlertCard
                                key={alert.id}
                                alert={alert}
                                bovineName={bInfo?.name}
                                bovineCode={bInfo?.code}
                                onMarkAsRead={markAsRead}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
