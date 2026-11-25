import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { HealthPredictionCard } from "../../monitoring/components/HealthPredictionCard";

interface Props {
    bovineId: number;
    bovineName: string;
    onClose: () => void;
}

export function HealthPredictionModal({ bovineId, bovineName, onClose }: Props) {
    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                                🔔 BOV-{String(bovineId).padStart(3, '0')}
                            </span>
                            <h2 className="text-lg font-bold text-neutral-900 font-inter">
                                {bovineName}
                            </h2>
                        </div>
                        <p className="text-xs text-neutral-500 font-inter mt-0.5">
                            Evaluación preventiva de salud y riesgo de fiebre mediante IA
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <HealthPredictionCard bovineId={bovineId} />

                {/* Actions */}
                <div className="mt-5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                        Cerrar Diagnóstico
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
