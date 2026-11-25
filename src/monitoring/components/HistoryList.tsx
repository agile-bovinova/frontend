import { Activity, Thermometer, AlertTriangle, CheckCircle2, History } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { HealthRecord } from "../model/health-record";

dayjs.extend(utc);

interface Props {
    records: HealthRecord[];
}

export function HistoryList({ records }: Props) {
    if (records.length === 0) {
        return (
            <div className="bg-white rounded-[16px] border border-[#E1E7DF] p-6 text-center shadow-xs font-inter">
                <p className="text-sm text-[#7E8F82]">Sin registros históricos para este bovino.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[16px] border border-[#E1E7DF] p-5 shadow-xs font-inter flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C8F0DA] flex items-center justify-center text-[#10A065]">
                        <History className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#0E1A12]">Historial de Telemetría Reciente</h3>
                        <p className="text-[11px] text-[#7E8F82]">
                            {records.length} lectura{records.length === 1 ? "" : "s"} registrada{records.length === 1 ? "" : "s"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                {records.map((record) => (
                    <div
                        key={record.id}
                        className={`flex items-center justify-between px-4 py-3 rounded-[12px] border text-sm transition-all ${
                            record.isAlert
                                ? "border-red-200 bg-red-50/50 hover:bg-red-50"
                                : "border-[#E1E7DF] bg-[#F4F8F2]/60 hover:bg-[#F4F8F2]"
                        }`}
                    >
                        <div className="flex items-center gap-4 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                record.isAlert
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}>
                                {record.isAlert ? (
                                    <>
                                        <AlertTriangle className="w-3 h-3 text-red-600" />
                                        <span>Alerta</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>Normal</span>
                                    </>
                                )}
                            </span>

                            <span className="flex items-center gap-1.5 font-medium text-[#0E1A12]">
                                <Thermometer className="w-4 h-4 text-[#10A065]" />
                                <span className="font-mono">{record.temperature.toFixed(1)}</span> °C
                            </span>

                            <span className="flex items-center gap-1.5 font-medium text-[#0E1A12]">
                                <Activity className="w-4 h-4 text-[#2563eb]" />
                                <span className="font-mono">{record.heartRate.toFixed(0)}</span> BPM
                            </span>
                        </div>

                        <div className="text-right">
                            <span className="text-[#4F6354] text-xs font-mono block">
                                {dayjs.utc(record.recordedAt).local().format("DD/MM/YYYY HH:mm")}
                            </span>
                            <span className="text-[10px] text-[#7E8F82] font-mono">
                                {record.deviceId}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
