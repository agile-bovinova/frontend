import { useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Activity, Radio, AlertCircle } from "lucide-react";
import { useGlobalStore } from "../../shared/stores/global-store";
import { useMonitoringStore } from "../stores/monitoring-store";
import { useCollarStore } from "../../collars/stores/collar-store";
import { LatestRecordCard } from "../components/LatestRecordCard";
import { LiveTelemetryChart } from "../components/LiveTelemetryChart";
import { HistoryList } from "../components/HistoryList";
import { HealthPredictionCard } from "../components/HealthPredictionCard";

export function MonitoringPage() {
    const { animals, fetchAnimals } = useGlobalStore();
    const { collarForBovine, fetchCollars } = useCollarStore();
    const {
        selectedBovineId,
        setSelectedBovineId,
        latestRecord,
        records,
        loading,
        fetchLatest,
        fetchHistory,
    } = useMonitoringStore();

    useEffect(() => {
        fetchAnimals();
        fetchCollars();
    }, []);

    // Only bovines with a collar can stream IoT data, so the rest are hidden here.
    const monitorableAnimals = animals.filter(a => collarForBovine(a.id));
    // Bovines with collars can stream live IoT data; if none have collars yet, list all registered animals
    const displayAnimals = monitorableAnimals.length > 0 ? monitorableAnimals : animals;

    // Auto-select first animal if none selected and animals exist
    useEffect(() => {
        if (!selectedBovineId && displayAnimals.length > 0) {
            const firstId = displayAnimals[0].id;
            setSelectedBovineId(firstId);
            fetchLatest(firstId);
            fetchHistory(firstId);
        }
    }, [displayAnimals, selectedBovineId]);

    // Auto-refresh (polling): re-fetch every 5s while a bovine is selected
    useEffect(() => {
        if (!selectedBovineId) return;
        const interval = setInterval(() => {
            fetchLatest(selectedBovineId, true);
            fetchHistory(selectedBovineId, true);
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedBovineId]);

    const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        setSelectedBovineId(id);
        await Promise.all([fetchLatest(id), fetchHistory(id)]);
    };

    const selectedAnimal = animals.find(a => a.id === selectedBovineId);
    const selectedCollar = selectedBovineId ? collarForBovine(selectedBovineId) : null;

    return (
        <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full px-6 py-6 font-inter">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C8F0DA] flex items-center justify-center text-[#10A065]">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-[24px] leading-[32px] text-[#0E1A12] font-semibold font-inter">
                            Monitoreo IoT & Telemetría
                        </h1>
                        <p className="text-xs text-[#7E8F82] font-inter">
                            Seguimiento biométrico en tiempo real y diagnóstico predictivo asistido por IA
                        </p>
                    </div>
                </div>

                {selectedAnimal && (
                    <div className="flex items-center gap-2 bg-[#F4F8F2] border border-[#E1E7DF] px-3.5 py-1.5 rounded-full text-xs font-inter text-[#4F6354]">
                        <span className="w-2 h-2 rounded-full bg-[#10A065] animate-pulse" />
                        <span className="font-semibold text-[#0E1A12]">
                            {selectedAnimal.code || `BOV-${String(selectedAnimal.id).padStart(3, '0')}`} · {selectedAnimal.name}
                        </span>
                        {selectedCollar ? (
                            <span className="text-[#10A065] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] font-mono">
                                {selectedCollar.deviceId}
                            </span>
                        ) : (
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                                Sin collar
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Bovine Selector Banner */}
            <div className="bg-white rounded-[16px] border border-[#E1E7DF] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5 flex-1 max-w-md">
                    <label className="text-xs font-bold text-[#4F6354] uppercase tracking-wider font-inter">
                        Seleccionar Bovino para Monitoreo
                    </label>
                    <select
                        className="w-full bg-[#F4F8F2] border border-[#E1E7DF] rounded-[10px] px-3.5 py-2.5 text-sm font-inter text-[#0E1A12] font-medium focus:outline-none focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA] transition-all cursor-pointer"
                        value={selectedBovineId ?? ""}
                        onChange={handleSelect}
                    >
                        <option value="" disabled>-- Selecciona un bovino --</option>
                        {displayAnimals.map(animal => {
                            const hasCollar = Boolean(collarForBovine(animal.id));
                            const code = animal.code || `BOV-${String(animal.id).padStart(3, '0')}`;
                            return (
                                <option key={animal.id} value={animal.id}>
                                    🔔 {code} · {animal.name} ({hasCollar ? "Collar Conectado" : "Sin collar"})
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    {animals.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-[#7E8F82] italic">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span>No hay bovinos registrados aún.</span>
                        </div>
                    ) : monitorableAnimals.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                            <Radio className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Asigná un collar a tus bovinos en <strong>Ganado</strong> para recibir telemetría continua.</span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Loading */}
            {loading && !records.length && (
                <div className="flex justify-center items-center py-12">
                    <CircularProgress size={36} sx={{ color: "#10A065" }} />
                </div>
            )}

            {/* Dashboard Content */}
            {selectedBovineId && (
                <div className="flex flex-col gap-6">
                    {/* Two-Column Grid: Telemetry & AI Diagnostic */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Column: Live Chart + Latest Reading */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            {/* Live Chart Container */}
                            <div className="bg-white rounded-[16px] border border-[#E1E7DF] p-5 shadow-xs">
                                <LiveTelemetryChart records={records} />
                            </div>

                            {/* Latest Reading Card */}
                            {latestRecord ? (
                                <LatestRecordCard record={latestRecord} />
                            ) : (
                                <div className="bg-white rounded-[16px] border border-[#E1E7DF] p-6 text-center text-sm text-[#7E8F82]">
                                    Aún no hay lecturas de telemetría emitidas para este bovino.
                                </div>
                            )}
                        </div>

                        {/* Right Column: AI Health Prediction */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <HealthPredictionCard bovineId={selectedBovineId} />
                        </div>
                    </div>

                    {/* Bottom: History List */}
                    <HistoryList records={records} />
                </div>
            )}
        </div>
    );
}
