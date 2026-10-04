import CircularProgress from "@mui/material/CircularProgress";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useGlobalStore } from "../../shared/stores/global-store";
import { useAnimalStore } from "../stores/animals-store";
import { useCollarStore } from "../../collars/stores/collar-store";
import { makeCollarDeviceId } from "../../collars/lib/collar-id";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import {X as CloseIcon} from "lucide-react";
import {ImagePlus as AddPhotoAlternateIcon} from "lucide-react";

const MIN_TEMP = 30;
const MAX_TEMP = 45;
const MIN_HR = 10;
const MAX_HR = 150;

export function AddAnimalDialog() {
  const { isOpenModal, toggleModal, newAnimal, setNewAnimal, resetNewAnimal } =
    useAnimalStore();
  const { addAnimal, stables, breeds } = useGlobalStore();
  const isPlus = true;
  const { capacity, register, fetchCollars, availableNumbers } = useCollarStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [validationError, setValidationError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCollar, setSelectedCollar] = useState<number | "">("");

  // Load capacity so we can show remaining slots and block over-assignment.
  useEffect(() => {
    if (isPlus && isOpenModal) fetchCollars();
  }, [isPlus, isOpenModal, fetchCollars]);
  const hasRequiredFields =
    Boolean(newAnimal.name?.trim()) &&
    Boolean(newAnimal.gender) &&
    Boolean(newAnimal.birthDate) &&
    Boolean(newAnimal.breed?.trim()) &&
    Boolean(newAnimal.stableId) &&
    newAnimal.bovineImg instanceof File;

  const isThresholdValid =
    newAnimal.minTemperature <= newAnimal.maxTemperature &&
    newAnimal.minHeartRate <= newAnimal.maxHeartRate;

  // Match the backend [Range] exactly: BOTH min and max must sit inside the
  // bounds, not just one side. Otherwise the form lets through values the API
  // rejects with a 400 (e.g. max temp = 0).
  const inRange = (v: number, lo: number, hi: number) => v >= lo && v <= hi;
  const isRangeValid =
    inRange(newAnimal.minTemperature, MIN_TEMP, MAX_TEMP) &&
    inRange(newAnimal.maxTemperature, MIN_TEMP, MAX_TEMP) &&
    inRange(newAnimal.minHeartRate, MIN_HR, MAX_HR) &&
    inRange(newAnimal.maxHeartRate, MIN_HR, MAX_HR);

  const isCoherent =
    newAnimal.minTemperature <= newAnimal.maxTemperature &&
    newAnimal.minHeartRate <= newAnimal.maxHeartRate;

  const thresholdError = !isCoherent
    ? "El mínimo no puede ser mayor al máximo."
    : !isRangeValid
      ? "Los valores están fuera del rango biológico permitido."
      : "";

  const isBirthDateValid = newAnimal.birthDate
    ? !dayjs(newAnimal.birthDate).isAfter(dayjs())
    : false;
  const birthDateError = newAnimal.birthDate && !isBirthDateValid
    ? "La fecha de nacimiento no puede ser una fecha futura"
    : "";
  const canSubmit =
    hasRequiredFields && isBirthDateValid && isThresholdValid && isRangeValid;

  const handleClose = () => {
    resetNewAnimal();
    setValidationError("");
    setSelectedCollar("");
    toggleModal();
  };

  const handleSave = async () => {
    if (!(newAnimal.bovineImg instanceof File)) {
      setValidationError("Debes seleccionar una imagen para el animal");
      return;
    }

    if (
      !newAnimal.name?.trim() ||
      !newAnimal.gender ||
      !newAnimal.birthDate ||
      !newAnimal.breed?.trim() ||
      !newAnimal.stableId
    ) {
      setValidationError("Completa todos los campos");
      return;
    }

    if (newAnimal.minTemperature > newAnimal.maxTemperature) {
      setValidationError(
        "El umbral mínimo de temperatura no puede ser mayor al máximo",
      );
      return;
    }
    if (newAnimal.minHeartRate > newAnimal.maxHeartRate) {
      setValidationError(
        "El ritmo cardíaco mínimo no puede ser mayor al máximo",
      );
      return;
    }

    const today = dayjs();
    const birthDate = dayjs(newAnimal.birthDate);
    if (birthDate.isAfter(today)) {
      setValidationError(
        "La fecha de nacimiento no puede ser una fecha futura",
      );
      return;
    }

    setValidationError("");
    setIsSubmitting(true);

    // Check stable capacity before submitting
    const selectedStable = stables.find((s) => s.id === newAnimal.stableId);
    if (selectedStable && selectedStable.limit !== undefined) {
      const animalsInStable = useGlobalStore.getState().animals.filter(
        (a) => a.stableId === newAnimal.stableId,
      ).length;
      if (animalsInStable >= selectedStable.limit) {
        setValidationError(
          "El establo seleccionado está lleno. Elegí otro o aumentá su capacidad.",
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const created = await addAnimal(newAnimal);

      // Optional collar assignment (Plus only). Two-step: the bovine must exist
      // first so we have an id to assign the collar to.
      if (isPlus && created?.id && selectedCollar !== "") {
        const ok = await register(makeCollarDeviceId(selectedCollar), created.id);
        if (!ok) {
          setValidationError(
            "Bovino creado, pero el collar no se pudo asignar. Asignalo desde editar.",
          );
          setIsSubmitting(false);
          return;
        }
      }

      handleClose();
    } catch (error: any) {
      setValidationError(error.message || "Error al crear el animal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpenModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E1E7DF]">
          <h2 className="text-lg font-bold text-[#0E1A12] font-inter">Añadir animal</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-[8px] text-[#7E8F82] hover:text-[#0E1A12] hover:bg-[#F4F8F2] transition-all duration-150"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Foto */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-full bg-[#F4F8F2] border-2 border-dashed border-[#E1E7DF] flex items-center justify-center cursor-pointer hover:border-[#10A065] hover:bg-[#C8F0DA] transition-all duration-150 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {newAnimal.bovineImg instanceof File || typeof newAnimal.bovineImg === "string" ? (
                <img
                  src={
                    typeof newAnimal.bovineImg === "string"
                      ? newAnimal.bovineImg
                      : URL.createObjectURL(newAnimal.bovineImg)
                  }
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <AddPhotoAlternateIcon className="text-[#7E8F82] w-7 h-7" />
              )}
            </div>
            <span className="text-[11px] text-[#7E8F82] font-inter cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {newAnimal.bovineImg instanceof File || typeof newAnimal.bovineImg === "string"
                ? "Cambiar foto"
                : "Subir foto"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setValidationError("");
                  setNewAnimal({ bovineImg: e.target.files[0] });
                }
              }}
              className="hidden"
            />
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-[#0E1A12] font-inter">Nombre</label>
            <input
              id="name"
              type="text"
              autoComplete="off"
              placeholder="Rebeca"
              className="focus:outline-none border border-[#E1E7DF] px-3 py-2.5 rounded-[10px] text-sm text-[#0E1A12] font-inter placeholder-[#7E8F82] transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
              value={newAnimal.name || ""}
              onChange={(e) => setNewAnimal({ name: e.target.value })}
            />
          </div>

          {/* Género */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="gender" className="text-sm font-medium text-[#0E1A12] font-inter">Género</label>
            <select
              id="gender"
              className="focus:outline-none border border-[#E1E7DF] px-3 py-2.5 rounded-[10px] text-sm text-[#0E1A12] font-inter transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
              value={newAnimal.gender || ""}
              onChange={(e) => setNewAnimal({ gender: e.target.value })}
            >
              <option value="">Seleccionar</option>
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>
          </div>

          {/* Fecha nacimiento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0E1A12] font-inter">Fecha de nacimiento</label>
            <DatePicker
              value={newAnimal.birthDate ? dayjs(newAnimal.birthDate) : null}
              onChange={(date) => {
                if (date) {
                  setNewAnimal({ birthDate: date.format("YYYY-MM-DD") });
                }
              }}
              sx={{ width: "100%" }}
            />
            {birthDateError && (
              <span className="text-[#D04A3A] text-xs font-inter">{birthDateError}</span>
            )}
          </div>

          {/* Raza */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="breed" className="text-sm font-medium text-[#0E1A12] font-inter">Raza</label>
            <select
              id="breed"
              className="focus:outline-none border border-[#E1E7DF] px-3 py-2.5 rounded-[10px] text-sm text-[#0E1A12] font-inter transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
              value={newAnimal.breed || ""}
              onChange={(e) => {
                const selectedBreed = breeds.find((b) => b.name === e.target.value);
                setNewAnimal({
                  breed: e.target.value,
                  minTemperature: selectedBreed?.minTemperature ?? newAnimal.minTemperature,
                  maxTemperature: selectedBreed?.maxTemperature ?? newAnimal.maxTemperature,
                  minHeartRate: selectedBreed?.minHeartRate ?? newAnimal.minHeartRate,
                  maxHeartRate: selectedBreed?.maxHeartRate ?? newAnimal.maxHeartRate,
                });
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

          {/* Establo */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="stable" className="text-sm font-medium text-[#0E1A12] font-inter">Establo</label>
            <select
              id="stable"
              className="focus:outline-none border border-[#E1E7DF] px-3 py-2.5 rounded-[10px] text-sm text-[#0E1A12] font-inter transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA]"
              value={newAnimal.stableId || ""}
              onChange={(e) => setNewAnimal({ stableId: Number(e.target.value) })}
            >
              <option value="">Seleccionar establo</option>
              {stables.map((stable) => (
                <option key={stable.id} value={stable.id}>
                  {stable.name}
                </option>
              ))}
            </select>
          </div>

          {/* Umbrales */}
          <div>
            <h4 className="text-sm font-medium text-[#0E1A12] font-inter mb-3">
              Umbrales biométricos
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#4F6354] font-inter">Temp. Mín (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="focus:outline-none border border-[#E1E7DF] bg-white px-2.5 py-2 rounded-[8px] text-sm text-[#0E1A12] font-inter transition-all duration-200 focus:border-[#10A065]"
                  value={newAnimal.minTemperature}
                  onChange={(e) =>
                    setNewAnimal({ minTemperature: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#4F6354] font-inter">Temp. Máx (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="focus:outline-none border border-[#E1E7DF] bg-white px-2.5 py-2 rounded-[8px] text-sm text-[#0E1A12] font-inter transition-all duration-200 focus:border-[#10A065]"
                  value={newAnimal.maxTemperature}
                  onChange={(e) =>
                    setNewAnimal({ maxTemperature: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#4F6354] font-inter">Ritmo Mín (BPM)</label>
                <input
                  type="number"
                  className="focus:outline-none border border-[#E1E7DF] bg-white px-2.5 py-2 rounded-[8px] text-sm text-[#0E1A12] font-inter transition-all duration-200 focus:border-[#10A065]"
                  value={newAnimal.minHeartRate}
                  onChange={(e) =>
                    setNewAnimal({ minHeartRate: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#4F6354] font-inter">Ritmo Máx (BPM)</label>
                <input
                  type="number"
                  className="focus:outline-none border border-[#E1E7DF] bg-white px-2.5 py-2 rounded-[8px] text-sm text-[#0E1A12] font-inter transition-all duration-200 focus:border-[#10A065]"
                  value={newAnimal.maxHeartRate}
                  onChange={(e) =>
                    setNewAnimal({ maxHeartRate: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="mt-3 text-[11px] text-[#7E8F82] font-inter italic">
              Rangos aceptados: Temp (30-45°C) | Ritmo Cardíaco (10-150 BPM)
            </div>
            {thresholdError && (
              <div className="mt-1 text-[#D04A3A] text-xs font-medium font-inter">
                {thresholdError}
              </div>
            )}
          </div>

          {/* Collar IoT (solo Plus) */}
          {isPlus && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="deviceId" className="text-sm font-medium text-[#0E1A12] font-inter">
                  Collar IoT (opcional)
                </label>
                <span className="text-[11px] text-[#7E8F82] font-inter">
                  {capacity.available}/{capacity.allowance} disponibles
                </span>
              </div>
              <select
                id="deviceId"
                disabled={capacity.available <= 0}
                className="focus:outline-none border border-[#E1E7DF] px-3 py-2.5 rounded-[10px] text-sm text-[#0E1A12] font-inter transition-all duration-200 focus:border-[#10A065] focus:ring-2 focus:ring-[#C8F0DA] disabled:bg-[#F4F8F2] disabled:text-[#7E8F82]"
                value={selectedCollar}
                onChange={(e) =>
                  setSelectedCollar(e.target.value === "" ? "" : Number(e.target.value))
                }
              >
                <option value="">Sin collar</option>
                {availableNumbers().map((n) => (
                  <option key={n} value={n}>
                    Collar {n}
                  </option>
                ))}
              </select>
              {capacity.available <= 0 && (
                <span className="text-[11px] text-[#7E8F82] font-inter italic">
                  Sin collares disponibles. Solicitá uno adicional en Suscripción.
                </span>
              )}
            </div>
          )}

          {validationError && (
            <span className="text-[#D04A3A] text-sm text-center font-inter">
              {validationError}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-[#E1E7DF]">
          <button
            className="cursor-pointer px-5 py-2.5 rounded-[12px] text-sm font-medium text-[#4F6354] font-inter bg-[#F4F8F2] hover:bg-[#E1E7DF] transition-all duration-150"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            disabled={!canSubmit || isSubmitting}
            className="cursor-pointer px-5 py-2.5 rounded-[12px] text-sm font-medium text-white font-inter bg-gradient-to-r from-[#10A065] to-[#0A7E4D] transition-all duration-150 hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            onClick={handleSave}
          >
            {isSubmitting ? (
              <CircularProgress size={18} sx={{ color: "white" }} />
            ) : (
              "Añadir"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
