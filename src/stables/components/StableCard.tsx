import {Check as CheckIcon} from "lucide-react"
import {X as CloseIcon} from "lucide-react";
import {Trash2 as DeleteIcon} from "lucide-react";
import {Pencil as EditIcon} from "lucide-react";
import {House as CabinIcon} from "lucide-react";
import {Users as PeopleIcon} from "lucide-react";
import {PawPrint as PetsIcon} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useGlobalStore } from "../../shared/stores/global-store";
import { useAuthStore } from "../../auth/store/auth-store";
import { canEdit } from "../../shared/utils/access-control";
import { Stable } from "../model/stable";
import dayjs from "dayjs";

interface StableCardProps {
    stable: Stable;
}

export function StableCard({ stable }: StableCardProps) {
    const { deleteStable, updateStable, animals } = useGlobalStore();
    const editable = useAuthStore((s) => canEdit(s.user));

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAnimalsModal, setShowAnimalsModal] = useState(false);
    const [editedName, setEditedName] = useState(stable.name);
    const [editedLimit, setEditedLimit] = useState(stable.limit);
    const [editError, setEditError] = useState("");

    const animalsInStable = animals.filter(a => a.stableId === stable.id);
    const currentCount = animalsInStable.length;
    const capacity = stable.limit ?? 0;
    const percent = capacity > 0 ? Math.min((currentCount / capacity) * 100, 100) : 0;
    const barColor = percent >= 90 ? "bg-[#D04A3A]" : percent >= 70 ? "bg-[#B17A2B]" : "bg-[#10A065]";
    const barBg = percent >= 90 ? "bg-[#FFD9D2]" : percent >= 70 ? "bg-[#FFE9C8]" : "bg-[#C8F0DA]";

    const handleSave = async () => {
        setEditError("");
        if (editedLimit !== undefined && editedLimit < currentCount) {
            setEditError(
                `No se puede reducir la capacidad a ${editedLimit} porque el establo tiene ${currentCount} animales.`
            );
            return;
        }
        try {
            const updateData = { ...stable, name: editedName };
            if (editedLimit !== undefined) updateData.limit = editedLimit;
            await updateStable(updateData);
            setIsEditing(false);
        } catch (error: any) {
            setEditError(error.message || "Error al actualizar el establo.");
        }
    };

    const handleCancel = () => {
        setEditedName(stable.name);
        setEditedLimit(stable.limit);
        setIsEditing(false);
    };

    const handleCardClick = () => {
        if (!isEditing && !showDeleteConfirm) {
            setShowAnimalsModal(true);
        }
    };

    return (
        <div
            className="rounded-[16px] bg-white shadow-md border-l-[4px] border-[#10A065] p-4 transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            onClick={handleCardClick}
        >
            {isEditing ? (
                <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#C8F0DA] flex items-center justify-center shrink-0">
                            <CabinIcon className="text-[#10A065] w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <label className="text-[11px] font-medium text-[#4F6354] font-inter block mb-0.5">Nombre</label>
                                    <input
                                        className="text-base font-bold text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-3 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-1 shrink-0 ml-2">
                                    <button className="p-1.5 rounded-[8px] text-[#10A065] hover:bg-[#C8F0DA] transition-all duration-150" onClick={handleSave} title="Guardar">
                                        <CheckIcon className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 rounded-[8px] text-[#D04A3A] hover:bg-[#FFD9D2] transition-all duration-150" onClick={handleCancel} title="Cancelar">
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-[#C8F0DA] to-transparent my-3" />

                    <div>
                        <label className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block mb-0.5">Capacidad máxima</label>
                        <input
                            type="number"
                            className="text-sm text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-2.5 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                            value={editedLimit}
                            onChange={(e) => { setEditError(""); setEditedLimit(Number(e.target.value)); }}
                        />
                    </div>
                    {editError && (
                        <span className="text-[#D04A3A] text-xs font-inter">{editError}</span>
                    )}
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#C8F0DA] flex items-center justify-center shrink-0">
                            <CabinIcon className="text-[#10A065] w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-[#0E1A12] text-base font-bold font-inter truncate">{stable.name}</h3>
                                </div>
                                {editable && (
                                    <div className="flex gap-1 shrink-0 ml-2">
                                        <button className="p-1.5 rounded-[8px] text-[#7E8F82] hover:text-[#10A065] hover:bg-[#C8F0DA] transition-all duration-150" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} title="Editar">
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded-[8px] text-[#7E8F82] hover:text-[#D04A3A] hover:bg-[#FFD9D2] transition-all duration-150" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }} title="Eliminar">
                                            <DeleteIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-[#C8F0DA] to-transparent my-3" />

                    <div className="flex items-center gap-2 mb-2">
                        <PeopleIcon className="w-4 h-4 text-[#10A065] shrink-0" />
                        <div>
                            <span className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block">Capacidad</span>
                            <span className="text-[#0E1A12] text-sm font-medium font-inter">{stable.limit} animales</span>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-[#4F6354] font-inter">{currentCount} ocupados</span>
                            <span className="text-[11px] text-[#4F6354] font-inter">{Math.round(percent)}%</span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${barBg}`}>
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {showAnimalsModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAnimalsModal(false)}>
                    <div className="bg-white rounded-[20px] shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E1E7DF]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#C8F0DA] flex items-center justify-center text-[#10A065]">
                                    <PetsIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#0E1A12] font-inter">{stable.name}</h2>
                                    <p className="text-xs text-[#4F6354] font-inter">{currentCount} animales</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAnimalsModal(false)}
                                className="p-1 rounded-[8px] text-[#7E8F82] hover:text-[#0E1A12] hover:bg-[#F4F8F2] transition-all duration-150"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {animalsInStable.length === 0 ? (
                                <p className="text-[#4F6354] text-sm font-inter italic text-center py-8">No hay animales en este establo</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {animalsInStable.map(a => {
                                        const isFemale = a.gender?.toLowerCase() === "female";
                                        const symbol = isFemale ? "♀" : "♂";
                                        const color = isFemale ? "text-[#B17A2B]" : "text-[#3A82B0]";
                                        const bg = isFemale ? "bg-[#FFE9C8]" : "bg-[#CFE6F2]";
                                        return (
                                            <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-[#F4F8F2] transition-all duration-150">
                                                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0 overflow-hidden`}>
                                                    {typeof a.bovineImg === "string" ? (
                                                        <img src={a.bovineImg} alt={a.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className={`text-lg font-bold ${color}`}>{symbol}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-base font-semibold text-[#0E1A12] font-inter flex items-center gap-1.5 truncate">
                                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                                                            🔔 BOV-{String(a.id).padStart(3, '0')}
                                                        </span>
                                                        <span>{a.name}</span>
                                                        <span className={`text-sm ${color}`}>{symbol}</span>
                                                    </span>
                                                    <span className="text-xs text-[#4F6354] font-inter">
                                                        {a.breed} · {dayjs().diff(dayjs(a.birthDate), "year")} años
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showDeleteConfirm && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-white rounded-[20px] shadow-xl w-full max-w-sm mx-4 p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-[#0E1A12] font-inter mb-2">Eliminar establo</h3>
                        <p className="text-sm text-[#4F6354] font-inter mb-6">
                            ¿Estás seguro de que querés eliminar <strong>{stable.name}</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                className="cursor-pointer px-4 py-2 rounded-[12px] text-sm font-medium text-[#4F6354] font-inter bg-[#F4F8F2] hover:bg-[#E1E7DF] transition-all duration-150"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="cursor-pointer px-4 py-2 rounded-[12px] text-sm font-medium text-white font-inter bg-gradient-to-r from-[#D04A3A] to-[#B33A2E] transition-all duration-150 hover:shadow-lg active:scale-[0.97]"
                                onClick={() => { deleteStable(stable); setShowDeleteConfirm(false); }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
