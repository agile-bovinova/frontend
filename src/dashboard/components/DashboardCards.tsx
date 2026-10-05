import {House as CabinIcon} from "lucide-react";
import {Megaphone as CampaignIcon} from "lucide-react";
import {Package as InventoryIcon} from "lucide-react";
import {PawPrint as PetsIcon} from "lucide-react";
import dayjs from "dayjs";
import { DashboardCard } from "./DashboardCard";
import { useGlobalStore } from "../../shared/stores/global-store";

const variants = [
  { disc: "bg-[#C8F0DA]", icon: "text-[#10A065]" },
  { disc: "bg-[#FFE9C8]", icon: "text-[#B17A2B]" },
  { disc: "bg-[#CFE6F2]", icon: "text-[#3A82B0]" },
] as const;

export function DashboardCards() {
  const { info, animals, stables, campaigns, products } =
    useGlobalStore();

  const cards = [
    {
      title: "Ganado",
      content: info?.totalAnimals?.toString() || "0",
      icon: <PetsIcon />,
      items: animals.slice(0, 4).map((a) => ({
        label: a.name || "—",
        detail:
          a.gender?.toLowerCase() === "male" ? (
            <>
              <span className="text-[#3A82B0]">♂</span> Macho
            </>
          ) : a.gender?.toLowerCase() === "female" ? (
            <>
              <span className="text-[#B17A2B]">♀</span> Hembra
            </>
          ) : (
            "—"
          ),
      })),
      route: "/animals",
    },
    {
      title: "Establos",
      content: info?.totalStables?.toString() || "0",
      icon: <CabinIcon />,
      items: stables.slice(0, 4).map((s) => ({
        label: s.name || "—",
        progress: s.limit
          ? {
              current: animals.filter((a) => a.stableId === s.id).length,
              max: s.limit,
            }
          : undefined,
        detail: s.limit ? undefined : "—",
      })),
      route: "/stables",
    },
    {
      title: "Campañas",
      content: info?.totalCampaigns?.toString() || "0",
      icon: <CampaignIcon />,
      items: campaigns.slice(0, 4).map((c) => {
        const dateRange =
          c.startDate && c.endDate
            ? `${dayjs(c.startDate).format("DD/MM")} - ${dayjs(c.endDate).format("DD/MM")}`
            : "";
        const status = c.isActive ? "Activa" : "Inactiva";
        return {
          label: c.name || "—",
          detail: dateRange ? `${status} · ${dateRange}` : status,
        };
      }),
      route: "/campaigns",
    },
    {
      title: "Inventario",
      content: info?.totalProducts?.toString() || "0",
      icon: <InventoryIcon />,
      items: products.slice(0, 4).map((p) => ({
        label: p.name || "—",
        detail: p.unit ? `${p.quantity} ${p.unit}` : `${p.quantity} uds.`,
      })),
      route: "/inventory",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card, i) => (
        <DashboardCard
          key={card.title}
          title={card.title}
          content={card.content}
          icon={card.icon}
          discClass={variants[i % variants.length].disc}
          iconClass={variants[i % variants.length].icon}
          items={card.items}
          route={card.route}
        />
      ))}
    </div>
  );
}
