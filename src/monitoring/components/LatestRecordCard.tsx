import { Activity, Thermometer, AlertTriangle, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { HealthRecord } from "../model/health-record";
import { BOVINE_RANGES } from "../model/health-record";

dayjs.extend(utc);

interface Props {
    record: HealthRecord;
}

export function LatestRecordCard({ record }: Props) {
    const tempOk = record.temperature >= BOVINE_RANGES.temperature.min && record.temperature <= BOVINE_RANGES.temperature.max;
    const hrOk   = record.heartRate   >= BOVINE_RANGES.heartRate.min   && record.heartRate   <= BOVINE_RANGES.heartRate.max;

    const isAlert = !tempOk || !hrOk || record.isAlert;

    return (
        <div className={`rounded-[16px] border p-5 shadow-xs font-inter transition-all ${
            isAlert 
                ? "bg-red-50/70 border-red-200" 
                : "bg-white border-[#E1E7DF]"
        }`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isAlert ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                    }`}>
                        <Activity className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#0E1A12]">Última Lectura de Telemetría</h3>
                        <p className="text-[11px] text-[#7E8F82]">
                            {dayjs.utc(record.recordedAt).local().format("DD/MM/YYYY HH:mm:ss")} · Sensor {record.deviceId}
                        </p>
                    </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isAlert 
                        ? "bg-red-100 text-red-700 border border-red-200" 
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}>
                    {isAlert ? (
                        <>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span>Fuera de rango</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Parámetros normales</span>
                        </>
                    )}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Temperature */}
                <div className={`p-3.5 rounded-[12px] border ${
                    tempOk 
                        ? "bg-[#F4F8F2] border-[#E1E7DF]" 
                        : "bg-red-100/60 border-red-200"
                }`}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#4F6354] flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5 text-[#10A065]" />
                            Temperatura
                        </span>
                        {!tempOk && <span className="text-[10px] font-bold text-red-600 uppercase">Alerta</span>}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold font-mono ${tempOk ? "text-[#0E1A12]" : "text-red-700"}`}>
                            {record.temperature.toFixed(1)}
                        </span>
                        <span className="text-xs text-[#7E8F82]">°C</span>
                    </div>
                    <span className="text-[10px] text-[#7E8F82] mt-0.5 block">
                        Rango óptimo: {BOVINE_RANGES.temperature.min} - {BOVINE_RANGES.temperature.max} °C
                    </span>
                </div>

                {/* Heart rate */}
                <div className={`p-3.5 rounded-[12px] border ${
                    hrOk 
                        ? "bg-[#F4F8F2] border-[#E1E7DF]" 
                        : "bg-red-100/60 border-red-200"
                }`}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#4F6354] flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-[#2563eb]" />
                            Ritmo Cardíaco
                        </span>
                        {!hrOk && <span className="text-[10px] font-bold text-red-600 uppercase">Alerta</span>}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold font-mono ${hrOk ? "text-[#0E1A12]" : "text-red-700"}`}>
                            {record.heartRate.toFixed(0)}
                        </span>
                        <span className="text-xs text-[#7E8F82]">BPM</span>
                    </div>
                    <span className="text-[10px] text-[#7E8F82] mt-0.5 block">
                        Rango óptimo: {BOVINE_RANGES.heartRate.min} - {BOVINE_RANGES.heartRate.max} BPM
                    </span>
                </div>
            </div>
        </div>
    );
}
