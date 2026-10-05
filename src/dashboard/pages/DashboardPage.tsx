import { useEffect, useMemo } from "react";
import { useGlobalStore } from "../../shared/stores/global-store";
import { DashboardCards } from "../components/DashboardCards";
import { HealthSummary } from "../components/HealthSummary";
import { NextCampaigns } from "../components/NextCampaigns";
import {Mars as MaleIcon} from "lucide-react";
import {Venus as FemaleIcon} from "lucide-react";
import {House as CabinIcon} from "lucide-react";
import {Package as InventoryIcon} from "lucide-react";
import {Megaphone as CampaignIcon} from "lucide-react";
import {Tag as LabelIcon} from "lucide-react";

export function DashboardPage() {
  const {
    info,
    animals,
    stables,
    campaigns,
    products,
    categories,
    fetchInfo,
    fetchAnimals,
    fetchStables,
    fetchCampaigns,
    fetchCategories,
    fetchProducts,
  } = useGlobalStore();

  useEffect(() => {
    fetchInfo();
    fetchAnimals();
    fetchStables();
    fetchCampaigns();
    fetchCategories();
    fetchProducts();
  }, []);

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.isActive).length,
    [campaigns],
  );

  const maleCount = useMemo(
    () => animals.filter((a) => a.gender?.toLowerCase() === "male").length,
    [animals],
  );

  const femaleCount = useMemo(
    () => animals.filter((a) => a.gender?.toLowerCase() === "female").length,
    [animals],
  );

  const totalCapacity = useMemo(
    () => stables.reduce((sum, s) => sum + (s.limit || 0), 0),
    [stables],
  );

  const occupied = useMemo(
    () => animals.filter((a) => a.stableId).length,
    [animals],
  );

  const totalProductQty = useMemo(
    () => products.reduce((sum, p) => sum + (p.quantity || 0), 0),
    [products],
  );

  const capPct =
    totalCapacity > 0 ? Math.min((occupied / totalCapacity) * 100, 100) : 0;
  const capColors = ["bg-[#10A065]", "bg-[#B17A2B]", "bg-[#D04A3A]"] as const;
  const capBarColor =
    capPct >= 100 ? capColors[2] : capPct >= 80 ? capColors[1] : capColors[0];

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <div className="rounded-[16px] bg-gradient-to-br from-[#C8F0DA] to-[#F4F8F2] p-6 border border-[#D8E8DD]">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#0A7E4D]">
                <span className="text-lg">👋</span>
              </div>
              <div>
                <h2 className="text-[24px] leading-[32px] text-[#0E1A12] font-semibold">
                  Bienvenido{info?.name ? `, ${info.name}` : ""}
                </h2>
                <p className="text-[#4F6354] text-sm">
                  Panel de control — VacApp
                </p>
              </div>
            </div>
          </div>

          <HealthSummary />

          <DashboardCards />
        </div>

        <div className="xl:w-[400px]">
          <NextCampaigns />
        </div>
      </div>

      <div className="rounded-[16px] bg-white shadow-md border border-[#E1E7DF] p-5">
        <h3 className="font-inter font-semibold text-[#0E1A12] text-base mb-4">
          Resumen rápido
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[#7E8F82] text-[11px] font-inter font-medium uppercase tracking-wider">
              <MaleIcon size={14} color="#3A82B0" />
              Machos
            </span>
            <span className="text-[#0E1A12] text-xl font-bold font-inter">
              {maleCount}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[#7E8F82] text-[11px] font-inter font-medium uppercase tracking-wider">
              <FemaleIcon size={14} color="#B17A2B" />
              Hembras
            </span>
            <span className="text-[#0E1A12] text-xl font-bold font-inter">
              {femaleCount}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[#7E8F82] text-[11px] font-inter font-medium uppercase tracking-wider">
              <CabinIcon size={14} color="#10A065" />
              Capacidad total
            </span>
            <span className="text-[#0E1A12] text-xl font-bold font-inter">
              {occupied}/{totalCapacity}
            </span>
            <div className="w-full h-1.5 rounded-full bg-[#E1E7DF] mt-1">
              <div
                className={`h-1.5 rounded-full ${capBarColor} transition-all duration-300`}
                style={{ width: `${capPct}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[#7E8F82] text-[11px] font-inter font-medium uppercase tracking-wider">
              <LabelIcon size={14} color="#7C5FA0" />
              Categorías
            </span>
            <span className="text-[#0E1A12] text-xl font-bold font-inter">
              {categories.length}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[#7E8F82] text-[11px] font-inter font-medium uppercase tracking-wider">
              <InventoryIcon size={14} color="#4F6354" />
              Unidades
            </span>
            <span className="text-[#0E1A12] text-xl font-bold font-inter">
              {totalProductQty}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[#7E8F82] text-[11px] font-inter font-medium uppercase tracking-wider">
              <CampaignIcon size={14} color="#B17A2B" />
              Campañas activas
            </span>
            <span className="text-[#0E1A12] text-xl font-bold font-inter">
              {activeCampaigns}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
