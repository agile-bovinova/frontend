import { useEffect, useState } from "react";
import { Sparkles, Brain, RefreshCw, AlertTriangle, CheckCircle2, AlertCircle, Thermometer, HeartPulse, Activity, SunMedium } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import { aiPredictionService } from "../services/ai-prediction-service";
import type { BovineHealthPrediction } from "../model/health-prediction";
import dayjs from "dayjs";

interface Props {
    bovineId: number;
}

export function HealthPredictionCard({ bovineId }: Props) {
    const [prediction, setPrediction] = useState<BovineHealthPrediction | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPrediction = async () => {
        if (!bovineId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await aiPredictionService.getPrediction(bovineId);
            setPrediction(data);
        } catch (err: any) {
            console.error("Error al obtener predicción de salud IA:", err);
            setError(err?.message || "No se pudo calcular la predicción predictiva.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPrediction();
    }, [bovineId]);

    if (loading && !prediction) {
        return (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col items-center justify-center gap-3">
                <CircularProgress size={28} className="text-[#10A065]" />
                <span className="text-xs text-neutral-500 font-inter font-medium">
                    Ejecutando inferencia en tiempo real con modelo Random Forest (ONNX)...
                </span>
            </div>
        );
    }

    if (error && !prediction) {
        return (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4 text-xs text-red-600 flex items-center justify-between">
                <span>{error}</span>
                <button
                    onClick={loadPrediction}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-medium text-xs transition"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!prediction) return null;

    const isHigh = prediction.riskPercentage >= 70;
    const isModerate = prediction.riskPercentage >= 35 && prediction.riskPercentage < 70;

    const cardBg = isHigh ? "bg-red-50/60 border-red-300" : isModerate ? "bg-amber-50/60 border-amber-300" : "bg-emerald-50/50 border-emerald-300";
    const headerPill = isHigh ? "bg-red-100 text-red-700 border-red-200" : isModerate ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200";
    const progressColor = isHigh ? "bg-red-500" : isModerate ? "bg-amber-500" : "bg-emerald-500";

    return (
        <div className={`rounded-2xl border p-5 shadow-sm font-inter transition-all ${cardBg}`}>
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-neutral-200 flex items-center justify-center text-[#10A065]">
                        <Brain className="w-5 h-5 text-[#10A065]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
                                Diagnóstico Predictivo IA
                                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                            </h3>
                        </div>
                        <p className="text-xs text-neutral-500">
                            Evaluación de riesgo a 12-24 horas en base a telemetría reciente
                        </p>
                    </div>
                </div>

                <button
                    onClick={loadPrediction}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-sm border border-neutral-200 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Actualizar inferencia predictiva"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${loading ? "animate-spin" : ""}`} />
                    <span>Re-analizar</span>
                </button>
            </div>

            {/* Risk Gauge Bar */}
            <div className="bg-white/90 rounded-xl p-4 border border-neutral-200 shadow-xs mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {isHigh ? (
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                        ) : isModerate ? (
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        )}
                        <div>
                            <span className="text-xs text-neutral-500 font-medium block">Nivel de Riesgo Fisiológico</span>
                            <span className="text-sm font-bold text-neutral-900">{prediction.badge} {prediction.riskLevel}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-neutral-400 font-medium block">Probabilidad</span>
                        <span className="text-lg font-black text-neutral-900">{prediction.riskPercentage}%</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${Math.min(100, Math.max(4, prediction.riskPercentage))}%` }}
                    />
                </div>

                <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-medium">
                    <span>0% (Bajo)</span>
                    <span>35% (Moderado)</span>
                    <span>70% (Alto)</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Physiological Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <div className="bg-white/90 p-2.5 rounded-xl border border-neutral-200">
                    <span className="text-[10px] font-medium text-neutral-500 flex items-center gap-1 uppercase tracking-wider">
                        <Thermometer className="w-3 h-3 text-red-400" /> Temp. Base
                    </span>
                    <span className="text-sm font-bold text-neutral-800 mt-0.5 block">
                        {prediction.currentTemperature.toFixed(1)} °C
                    </span>
                    <span className={`text-[10px] font-semibold ${prediction.tempSlope3h > 0 ? "text-red-500" : "text-emerald-600"}`}>
                        {prediction.tempSlope3h >= 0 ? "+" : ""}{prediction.tempSlope3h.toFixed(2)} °C (3h)
                    </span>
                </div>

                <div className="bg-white/90 p-2.5 rounded-xl border border-neutral-200">
                    <span className="text-[10px] font-medium text-neutral-500 flex items-center gap-1 uppercase tracking-wider">
                        <HeartPulse className="w-3 h-3 text-rose-400" /> Pulso
                    </span>
                    <span className="text-sm font-bold text-neutral-800 mt-0.5 block">
                        {prediction.currentHeartRate.toFixed(0)} BPM
                    </span>
                    <span className={`text-[10px] font-semibold ${prediction.hrSlope3h > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                        {prediction.hrSlope3h >= 0 ? "+" : ""}{prediction.hrSlope3h.toFixed(0)} BPM (3h)
                    </span>
                </div>

                <div className="bg-white/90 p-2.5 rounded-xl border border-neutral-200">
                    <span className="text-[10px] font-medium text-neutral-500 flex items-center gap-1 uppercase tracking-wider">
                        <Activity className="w-3 h-3 text-indigo-400" /> Variabilidad
                    </span>
                    <span className="text-sm font-bold text-neutral-800 mt-0.5 block">
                        ±{prediction.tempVariability3h.toFixed(2)} °C
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                        Oscilación 3h
                    </span>
                </div>

                <div className="bg-white/90 p-2.5 rounded-xl border border-neutral-200">
                    <span className="text-[10px] font-medium text-neutral-500 flex items-center gap-1 uppercase tracking-wider">
                        <SunMedium className="w-3 h-3 text-amber-500" /> Índice THI
                    </span>
                    <span className="text-sm font-bold text-neutral-800 mt-0.5 block">
                        {prediction.thiIndex.toFixed(0)}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                        Estrés calórico
                    </span>
                </div>
            </div>

            {/* Diagnostic Details */}
            <div className="space-y-2.5 bg-white/90 p-3.5 rounded-xl border border-neutral-200 text-xs">
                <div>
                    <span className="font-semibold text-neutral-700 block mb-0.5">Horizonte Temporal Estimado:</span>
                    <span className={`inline-block font-semibold px-2 py-0.5 rounded-md border text-xs ${headerPill}`}>
                        {prediction.timeHorizon}
                    </span>
                </div>

                <div>
                    <span className="font-semibold text-neutral-700 block mb-0.5">Factor Biométrico Determinante:</span>
                    <p className="text-neutral-600 leading-relaxed">{prediction.primaryFactor}</p>
                </div>

                <div>
                    <span className="font-semibold text-neutral-700 block mb-0.5">Acción Veterinaria Recomendada:</span>
                    <p className="text-neutral-700 font-medium leading-relaxed bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                        {prediction.recommendedAction}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-400">
                <span>Lecturas analizadas: {prediction.readingsEvaluated} registros históricos</span>
                <span>Evaluado: {dayjs(prediction.evaluatedAt).format("DD/MM/YYYY HH:mm:ss")}</span>
            </div>
        </div>
    );
}
