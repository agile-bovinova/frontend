import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, AlertCircle, ShieldCheck, HeartPulse } from "lucide-react";
import { useGlobalStore } from "../../shared/stores/global-store";
import { useAlertsStore } from "../../alerts/stores/alerts-store";

/**
 * RF-26: herd-level sanitary summary. Buckets every registered bovine by its current
 * health status, derived from active (unread) alerts:
 *   🔴 En riesgo   — has an active critical (Red) alert
 *   🟡 En observación — has an active moderate (Yellow) alert (and no Red)
 *   🟢 Sanos       — no active alert
 * The pieces already existed separately (alerts per bovine); this consolidates them.
 */
export function HealthSummary() {
    const navigate = useNavigate();
    const { info, animals } = useGlobalStore();
    const { alerts, fetchAlerts } = useAlertsStore();

    useEffect(() => {
        if (info?.id) fetchAlerts(info.id);
    }, [info?.id]);

    const { atRisk, attention, healthy, activeCount } = useMemo(() => {
        // "Active" = unread/unresolved alerts.
        const active = alerts.filter(a => a.isUnread);

        const redBovines = new Set(
            active.filter(a => a.isRed && a.bovineId != null).map(a => a.bovineId as number)
        );
        const yellowBovines = new Set(
            active
                .filter(a => a.isYellow && a.bovineId != null && !redBovines.has(a.bovineId as number))
                .map(a => a.bovineId as number)
        );

        const total = animals.length;
        const risk = redBovines.size;
        const attn = yellowBovines.size;
        return {
            atRisk: risk,
            attention: attn,
            healthy: Math.max(0, total - risk - attn),
            activeCount: active.length,
        };
    }, [alerts, animals]);

    const tiles = [
        {
            label: "En riesgo",
            hint: "Alerta crítica activa",
            value: atRisk,
            icon: <AlertTriangle size={18} />,
            disc: "bg-[#FBE3DF]",
            iconColor: "text-[#D04A3A]",
            valueColor: "text-[#D04A3A]",
        },
        {
            label: "En observación",
            hint: "Alerta moderada activa",
            value: attention,
            icon: <AlertCircle size={18} />,
            disc: "bg-[#FFE9C8]",
            iconColor: "text-[#B17A2B]",
            valueColor: "text-[#B17A2B]",
        },
        {
            label: "Sanos",
            hint: "Sin alertas activas",
            value: healthy,
            icon: <ShieldCheck size={18} />,
            disc: "bg-[#C8F0DA]",
            iconColor: "text-[#0A7E4D]",
            valueColor: "text-[#0A7E4D]",
        },
    ];

    return (
        <div className="rounded-[16px] bg-white shadow-md border border-[#E1E7DF] p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <HeartPulse size={18} className="text-[#0A7E4D]" />
                    <h3 className="font-inter font-semibold text-[#0E1A12] text-base">
                        Estado sanitario de los establos
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/alerts")}
                    className="text-sm text-[#0A7E4D] hover:underline font-medium"
                >
                    {activeCount > 0 ? `${activeCount} alerta${activeCount === 1 ? "" : "s"} activa${activeCount === 1 ? "" : "s"}` : "Ver alertas"}
                </button>
            </div>

            {animals.length === 0 ? (
                <p className="text-neutral-400 text-sm">
                    Aún no hay bovinos registrados para monitorear.
                </p>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {tiles.map(tile => (
                        <div key={tile.label} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-9 h-9 rounded-full flex items-center justify-center ${tile.disc} ${tile.iconColor}`}>
                                    {tile.icon}
                                </span>
                                <span className={`text-2xl font-bold font-inter ${tile.valueColor}`}>
                                    {tile.value}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#0E1A12] text-sm font-semibold font-inter">
                                    {tile.label}
                                </span>
                                <span className="text-[#7E8F82] text-[11px] font-inter">
                                    {tile.hint}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
