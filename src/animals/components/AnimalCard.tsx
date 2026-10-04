import {Check as CheckIcon} from "lucide-react"
import {X as CloseIcon} from "lucide-react";
import {Trash2 as DeleteIcon} from "lucide-react";
import {Pencil as EditIcon} from "lucide-react";
import {Cake as CakeIcon} from "lucide-react"
import {PawPrint as PetsIcon} from "lucide-react";
import {House as HomeIcon} from "lucide-react";
import {Thermometer as DeviceThermostatIcon} from "lucide-react";
import {Heart as FavoriteIcon} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useGlobalStore } from "../../shared/stores/global-store";
import { useAuthStore } from "../../auth/store/auth-store";
import { canEdit } from "../../shared/utils/access-control";
import { CollarSection } from "../../collars/components/CollarSection";
import { Animal } from "../model/animal";
import dayjs from "dayjs";

interface AnimalCardProps {
  animal: Animal;
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const { deleteAnimal, updateAnimal, stables, breeds } = useGlobalStore();
  const isPlus = true;
  const editable = useAuthStore((s) => canEdit(s.user));

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedName, setEditedName] = useState(animal.name);
  const [editedGender, setEditedGender] = useState(animal.gender);
  const [editedBirthDate, setEditedBirthDate] = useState(animal.birthDate);
  const [editedBreed, setEditedBreed] = useState(animal.breed);
  const [editedStableId, setEditedStableId] = useState(animal.stableId);
  const [editedMinTemp, setEditedMinTemp] = useState(animal.minTemperature);
  const [editedMaxTemp, setEditedMaxTemp] = useState(animal.maxTemperature);
  const [editedMinHeart, setEditedMinHeart] = useState(animal.minHeartRate);
  const [editedMaxHeart, setEditedMaxHeart] = useState(animal.maxHeartRate);
  const [editError, setEditError] = useState("");

  const handleSave = async () => {
    setEditError("");

    if (dayjs(editedBirthDate).isAfter(dayjs())) {
      setEditError("La fecha de nacimiento no puede ser futura.");
      return;
    }

    // Check stable capacity if stable changed
    if (editedStableId !== animal.stableId) {
      const selectedStable = stables.find((s) => s.id === editedStableId);
      if (selectedStable && selectedStable.limit !== undefined) {
        const animalsInStable = useGlobalStore.getState().animals.filter(
          (a) => a.stableId === editedStableId && a.id !== animal.id,
        ).length;
        if (animalsInStable >= selectedStable.limit) {
          setEditError(
            "El establo seleccionado está lleno. Elegí otro o aumentá su capacidad.",
          );
          return;
        }
      }
    }

    try {
      await updateAnimal({
        ...animal,
        name: editedName,
        gender: editedGender,
        birthDate: editedBirthDate,
        breed: editedBreed,
        stableId: editedStableId,
        minTemperature: editedMinTemp,
        maxTemperature: editedMaxTemp,
        minHeartRate: editedMinHeart,
        maxHeartRate: editedMaxHeart,
      });
      setIsEditing(false);
    } catch (error: any) {
      setEditError(error.message || "Error al actualizar el animal.");
    }
  };

  const handleCancel = () => {
    setEditedName(animal.name);
    setEditedGender(animal.gender);
    setEditedBirthDate(animal.birthDate);
    setEditedBreed(animal.breed);
    setEditedStableId(animal.stableId);
    setEditedMinTemp(animal.minTemperature);
    setEditedMaxTemp(animal.maxTemperature);
    setEditedMinHeart(animal.minHeartRate);
    setEditedMaxHeart(animal.maxHeartRate);
    setIsEditing(false);
  };

  const isFemale = animal.gender?.toLowerCase() === "female";
  const genderSymbol = isFemale ? "♀" : "♂";
  const genderLabel = isFemale ? "Hembra" : "Macho";
  const genderColor = isFemale ? "text-[#B17A2B]" : "text-[#3A82B0]";
  const genderBg = isFemale ? "bg-[#FFE9C8]" : "bg-[#CFE6F2]";
  const genderPillBg = isFemale ? "bg-[#FFE9C8]" : "bg-[#CFE6F2]";
  const genderPillText = isFemale ? "text-[#B17A2B]" : "text-[#3A82B0]";
  const accentBorder = isFemale ? "border-[#FFE9C8]" : "border-[#CFE6F2]";
  const photoUrl =
    typeof animal.bovineImg === "string" ? animal.bovineImg : null;

  const stableName =
    stables.find((s) => s.id === animal.stableId)?.name ?? "Sin asignar";

  return (
    <div
      className={`rounded-[16px] bg-white shadow-md border-l-[4px] ${accentBorder} p-4 transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]`}
    >
      {isEditing ? (
        <div className="flex flex-col h-full">
          {/* Top: photo + name + actions */}
          <div className="flex gap-4">
            <div
              className={`w-20 h-20 rounded-full ${genderBg} flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white shadow-md`}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className={`text-3xl font-bold ${genderColor}`}>
                  {genderSymbol}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <input
                    className="text-lg font-bold text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-3 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                  <div className="mt-1">
                    <label className="text-[11px] font-medium text-[#4F6354] font-inter block">
                      Género
                    </label>
                    <select
                      className="text-sm font-medium font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-2.5 py-1 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                      value={editedGender}
                      onChange={(e) => setEditedGender(e.target.value)}
                    >
                      <option value="male">♂ Macho</option>
                      <option value="female">♀ Hembra</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button
                    className="p-1.5 rounded-[8px] text-[#10A065] hover:bg-[#C8F0DA] transition-all duration-150"
                    onClick={handleSave}
                    title="Guardar"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded-[8px] text-[#D04A3A] hover:bg-[#FFD9D2] transition-all duration-150"
                    onClick={handleCancel}
                    title="Cancelar"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Accent line */}
          <div
            className={`h-px bg-gradient-to-r ${isFemale ? "from-[#FFE9C8]" : "from-[#CFE6F2]"} to-transparent my-3`}
          />

          {/* Data grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block mb-0.5">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                className="text-sm text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-2.5 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                value={editedBirthDate}
                onChange={(e) => setEditedBirthDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block mb-0.5">
                Raza
              </label>
              <select
                className="text-sm text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-2.5 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                value={editedBreed}
                onChange={(e) => {
                  const selectedBreed = breeds.find((b) => b.name === e.target.value);
                  setEditedBreed(e.target.value);
                  if (selectedBreed) {
                    setEditedMinTemp(selectedBreed.minTemperature);
                    setEditedMaxTemp(selectedBreed.maxTemperature);
                    setEditedMinHeart(selectedBreed.minHeartRate);
                    setEditedMaxHeart(selectedBreed.maxHeartRate);
                  }
                }}
              >
                <option value="">Seleccionar raza</option>
                {breeds.map((breed) => (
                  <option key={breed.id} value={breed.name}>
                    {breed.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block mb-0.5">
                Establo
              </label>
              <select
                className="text-sm text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-2.5 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                value={editedStableId}
                onChange={(e) => setEditedStableId(Number(e.target.value))}
              >
                {stables.map((stable) => (
                  <option key={stable.id} value={stable.id}>
                    {stable.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block mb-0.5">
                Temp. Mín (°C)
              </label>
              <input
                type="number"
                step="0.1"
                className="text-sm text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-2.5 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                value={editedMinTemp}
                onChange={(e) => setEditedMinTemp(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block mb-0.5">
                Temp. Máx (°C)
              </label>
              <input
                type="number"
                step="0.1"
                className="text-sm text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-2.5 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                value={editedMaxTemp}
                onChange={(e) => setEditedMaxTemp(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block mb-0.5">
                HR Mín (BPM)
              </label>
              <input
                type="number"
                className="text-sm text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-2.5 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                value={editedMinHeart}
                onChange={(e) => setEditedMinHeart(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block mb-0.5">
                HR Máx (BPM)
              </label>
              <input
                type="number"
                className="text-sm text-[#0E1A12] font-inter focus:outline-none bg-[#F4F8F2] border border-[#E1E7DF] px-2.5 py-1.5 rounded-[8px] w-full transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
                value={editedMaxHeart}
                onChange={(e) => setEditedMaxHeart(Number(e.target.value))}
              />
            </div>
          </div>

          {editError && (
            <div className="text-[#D04A3A] text-xs text-center font-medium font-inter mt-2">
              {editError}
            </div>
          )}

          {isPlus && <CollarSection bovineId={animal.id} />}
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Top: photo + name + actions */}
          <div className="flex gap-4">
            <div
              className={`w-20 h-20 rounded-full ${genderBg} flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white shadow-md`}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className={`text-3xl font-bold ${genderColor}`}>
                  {genderSymbol}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[#0E1A12] text-lg font-bold font-inter truncate">
                    {animal.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-inter ${genderPillBg} ${genderPillText}`}
                    >
                      {genderSymbol} {genderLabel}
                    </span>
                  </div>
                </div>
                {editable && (
                  <div className="flex gap-1 shrink-0 ml-2">
                    <button
                      className="p-1.5 rounded-[8px] text-[#7E8F82] hover:text-[#10A065] hover:bg-[#C8F0DA] transition-all duration-150"
                      onClick={() => setIsEditing(true)}
                      title="Editar"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-[8px] text-[#7E8F82] hover:text-[#D04A3A] hover:bg-[#FFD9D2] transition-all duration-150"
                      onClick={() => setShowDeleteConfirm(true)}
                      title="Eliminar"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accent line */}
          <div
            className={`h-px bg-gradient-to-r ${isFemale ? "from-[#FFE9C8]" : "from-[#CFE6F2]"} to-transparent my-3`}
          />

          {/* Data grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <CakeIcon className="w-3.5 h-3.5 text-[#7E8F82] shrink-0" />
              <div>
                <span className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block">
                  Nacimiento
                </span>
                <span className="text-[#0E1A12] text-sm font-medium font-inter">
                  {dayjs(animal.birthDate).format("DD/MM/YYYY")}
                </span>
                <span className="text-[#7E8F82] text-xs font-inter ml-1">
                  · {dayjs().diff(dayjs(animal.birthDate), "year")} años
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PetsIcon className="w-3.5 h-3.5 text-[#7E8F82] shrink-0" />
              <div>
                <span className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block">
                  Raza
                </span>
                <span className="text-[#0E1A12] text-sm font-medium font-inter">
                  {animal.breed}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HomeIcon className="w-3.5 h-3.5 text-[#7E8F82] shrink-0" />
              <div>
                <span className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block">
                  Establo
                </span>
                <span className="text-[#0E1A12] text-sm font-medium font-inter truncate">
                  {stableName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DeviceThermostatIcon className="w-3.5 h-3.5 text-[#10A065] shrink-0" />
              <div>
                <span className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block">
                  Temperatura
                </span>
                <span className="text-[#0E1A12] text-sm font-medium font-inter">
                  {animal.minTemperature}°C - {animal.maxTemperature}°C
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteIcon className="w-3.5 h-3.5 text-[#D04A3A] shrink-0" />
              <div>
                <span className="text-[9px] text-[#7E8F82] font-inter uppercase tracking-wider block">
                  Ritmo Cardíaco
                </span>
                <span className="text-[#0E1A12] text-sm font-medium font-inter">
                  {animal.minHeartRate} - {animal.maxHeartRate} BPM
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="bg-white rounded-[20px] shadow-xl w-full max-w-sm mx-4 p-6 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#0E1A12] font-inter mb-2">
                Eliminar animal
              </h3>
              <p className="text-sm text-[#4F6354] font-inter mb-6">
                ¿Estás seguro de que querés eliminar a{" "}
                <strong>{animal.name}</strong>? Esta acción no se puede
                deshacer.
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
                  onClick={() => {
                    deleteAnimal(animal);
                    setShowDeleteConfirm(false);
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
