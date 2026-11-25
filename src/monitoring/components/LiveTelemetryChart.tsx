import { useEffect, useMemo, useRef, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";
import Slider from "@mui/material/Slider";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { BOVINE_RANGES, type HealthRecord } from "../model/health-record";

dayjs.extend(utc);

interface Props {
    records: HealthRecord[];
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Slider marks: 6h, 1d, 3d, 1 week.
const MARKS = [
    { value: 6, label: "6h" },
    { value: 24, label: "1d" },
    { value: 72, label: "3d" },
    { value: 168, label: "1sem" },
];

export function LiveTelemetryChart({ records }: Props) {
    const [hoursBack, setHoursBack] = useState(6);

    // `records` arrives newest-first; sort ascending once.
    const sorted = useMemo(
        () => [...records].sort(
            (a, b) => dayjs.utc(a.recordedAt).valueOf() - dayjs.utc(b.recordedAt).valueOf()
        ),
        [records],
    );

    // Keep readings within the selected window (slides as fresh telemetry lands).
    const { points, spanMs } = useMemo(() => {
        const now = Date.now();
        const fromMs = now - hoursBack * HOUR;
        return {
            points: sorted.filter(r => dayjs.utc(r.recordedAt).valueOf() >= fromMs),
            spanMs: hoursBack * HOUR,
        };
    }, [sorted, hoursBack]);

    // Detect a brand-new reading to flash the live indicator.
    const lastId = useRef<number | null>(null);
    const [live, setLive] = useState(false);
    useEffect(() => {
        const newestId = records[0]?.id ?? null;
        if (newestId !== null && lastId.current !== null && newestId !== lastId.current) {
            setLive(true);
            const t = setTimeout(() => setLive(false), 900);
            lastId.current = newestId;
            return () => clearTimeout(t);
        }
        lastId.current = newestId;
    }, [records]);

    const xFormat = spanMs > DAY ? "DD/MM HH:mm" : "HH:mm:ss";
    const times = points.map(p => new Date(dayjs.utc(p.recordedAt).valueOf()));
    const temps = points.map(p => p.temperature);
    const beats = points.map(p => p.heartRate);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-neutral-700">Telemetría en vivo</h3>
                <span
                    className={`flex items-center gap-1 text-xs font-medium transition-opacity duration-300
                        ${live ? "opacity-100" : "opacity-40"}`}
                >
                    <span className={`inline-block w-2 h-2 rounded-full bg-red-500 ${live ? "animate-ping" : ""}`} />
                    <span className="text-neutral-500">EN VIVO</span>
                </span>
            </div>

            {/* Time-window slider */}
            <div className="flex flex-col max-w-md">
                <span className="text-xs text-neutral-500">
                    Últimas {hoursBack} h ({points.length} lecturas)
                </span>
                <Slider
                    size="small"
                    min={1}
                    max={168}
                    step={1}
                    marks={MARKS}
                    value={hoursBack}
                    onChange={(_, v) => setHoursBack(v as number)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v} h`}
                />
            </div>

            {points.length === 0 ? (
                <p className="text-neutral-400 text-sm">Sin telemetría en este rango.</p>
            ) : (
                <LineChart
                    height={300}
                    xAxis={[{
                        data: times,
                        scaleType: "time",
                        valueFormatter: (v: Date) => dayjs(v).format(xFormat),
                    }]}
                    yAxis={[
                        { id: "temp", width: 50 },
                        { id: "bpm", position: "right", width: 50 },
                    ]}
                    series={[
                        {
                            data: temps,
                            label: "Temp (°C)",
                            yAxisId: "temp",
                            color: "#10b981", // Verde Esmeralda Vibrante
                            showMark: points.length <= 60,
                            valueFormatter: (v: number | null) => (v == null ? "" : `${v.toFixed(1)} °C`),
                        },
                        {
                            data: beats,
                            label: "Ritmo Cardíaco (BPM)",
                            yAxisId: "bpm",
                            color: "#2563eb", // Azul Real Intenso (Alto Contraste)
                            showMark: points.length <= 60,
                            valueFormatter: (v: number | null) => (v == null ? "" : `${v.toFixed(0)} BPM`),
                        },
                    ]}
                >
                    <ChartsReferenceLine axisId="temp" y={BOVINE_RANGES.temperature.max}
                        lineStyle={{ stroke: "#10b981", strokeDasharray: "4 4", strokeWidth: 1.5 }} />
                    <ChartsReferenceLine axisId="temp" y={BOVINE_RANGES.temperature.min}
                        lineStyle={{ stroke: "#10b981", strokeDasharray: "4 4", strokeWidth: 1.5 }} />
                    <ChartsReferenceLine axisId="bpm" y={BOVINE_RANGES.heartRate.max}
                        lineStyle={{ stroke: "#2563eb", strokeDasharray: "4 4", strokeWidth: 1.5 }} />
                    <ChartsReferenceLine axisId="bpm" y={BOVINE_RANGES.heartRate.min}
                        lineStyle={{ stroke: "#2563eb", strokeDasharray: "4 4", strokeWidth: 1.5 }} />
                </LineChart>
            )}
        </div>
    );
}
