import { useEffect, useState, type ReactNode } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {Menu as MenuIcon} from "lucide-react"
import {ChevronLeft as ChevronLeftIcon} from "lucide-react"
import {ChevronRight as ChevronRightIcon} from "lucide-react"
import {LayoutDashboard as DashboardIcon} from "lucide-react";
import {PawPrint as PetsIcon} from "lucide-react";
import {House as CabinIcon} from "lucide-react";
import {Megaphone as CampaignIcon} from "lucide-react";
import {Users as PeopleAltIcon} from "lucide-react";
import {Package as InventoryIcon} from "lucide-react";
import {HeartPulse as MonitorHeartIcon} from "lucide-react";
import {Bell as NotificationsIcon} from "lucide-react";
import {LogOut as LogoutIcon} from "lucide-react";
import { useAuthStore } from "../../auth/store/auth-store";
import { useGlobalStore } from "../stores/global-store";
import { AlertToaster } from "../../alerts/components/AlertToaster";
import { canManageStaff } from "../utils/access-control";

type NavItem = {
    to: string;
    icon: ReactNode;
    label: string;
    plusOnly?: boolean;
    requiresStaffManagement?: boolean;
    requiresSubscriptionManagement?: boolean;
};

const navItems: NavItem[] = [
    { to: "/dashboard", icon: <DashboardIcon />, label: "Panel" },
    { to: "/animals", icon: <PetsIcon />, label: "Ganado" },
    { to: "/stables", icon: <CabinIcon />, label: "Establos" },
    { to: "/campaigns", icon: <CampaignIcon />, label: "Campañas" },
    { to: "/staff", icon: <PeopleAltIcon />, label: "Personal", requiresStaffManagement: true },
    { to: "/inventory", icon: <InventoryIcon />, label: "Inventario" },
    { to: "/monitoring", icon: <MonitorHeartIcon />, label: "Monitoreo", plusOnly: true },
    { to: "/alerts", icon: <NotificationsIcon />, label: "Alertas" },
];

function SidebarContent({ expanded, onToggle, onNavigate }: { expanded: boolean; onToggle: () => void; onNavigate: () => void }) {
    const user = useAuthStore(s => s.user);
    const info = useGlobalStore(s => s.info);
    const logout = useAuthStore(s => s.logout);
    const navigate = useNavigate();
    const displayName = info?.name || user?.username || user?.email?.split('@')[0] || "Usuario";
    const initials = displayName.slice(0, 2).toUpperCase();

    const handleLogout = () => {
        logout();
        navigate("/auth", { replace: true });
        onNavigate();
    };

    return (
        <div className={`h-full flex flex-col bg-white transition-all duration-300 ${expanded ? 'w-[280px]' : 'w-[68px]'}`}>
            <div className={`bg-gradient-to-r from-[#10A065] to-[#0A7E4D] transition-all duration-300 ${expanded ? 'relative px-5 pt-8 pb-6' : 'px-0 pt-4 pb-3 flex flex-col items-center gap-2'}`}>
                {expanded && (
                    <IconButton
                        onClick={onToggle}
                        className="!absolute !top-3 !right-3 !text-white/70 hover:!text-white"
                        size="small"
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                )}

                {!expanded && (
                    <button
                        onClick={onToggle}
                        className="text-white/70 hover:text-white transition-all duration-150"
                        title="Expandir sidebar"
                    >
                        <ChevronRightIcon />
                    </button>
                )}

                <div className={`rounded-full overflow-hidden transition-all duration-300 ${expanded ? 'w-14 h-14 mb-3' : 'w-9 h-9'}`}>
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FFFFFF&color=10A065&bold=true&size=56`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove("hidden");
                        }}
                    />
                    <div className="w-full h-full bg-white/20 flex items-center justify-center hidden">
                        <span className="text-white text-xl font-bold font-inter select-none">{initials}</span>
                    </div>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 max-w-0'}`}>
                    <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold font-inter text-base leading-tight whitespace-nowrap">{displayName}</h3>
                        
                    </div>
                    <p className="text-white/60 text-sm font-inter truncate mt-0.5 whitespace-nowrap">{user?.email || ""}</p>
                </div>
            </div>

            <nav className={`flex-1 flex flex-col gap-0.5 transition-all duration-300 ${expanded ? 'p-3 mt-2' : 'p-2 mt-3 items-center'}`}>
                {navItems
                    .filter(item => !item.requiresStaffManagement || canManageStaff(user))
                    .map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/dashboard"}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-[10px] text-sm font-inter transition-all duration-150 ${
                                expanded
                                    ? `px-4 py-2.5 ${isActive ? "bg-[#C8F0DA] text-[#10A065] font-semibold" : "text-[#4F6354] hover:bg-[#E1E7DF] hover:text-[#0E1A12]"}`
                                    : `p-2.5 justify-center ${isActive ? "bg-[#C8F0DA] text-[#10A065]" : "text-[#4F6354] hover:bg-[#E1E7DF] hover:text-[#0E1A12]"}`
                            }`
                        }
                        title={!expanded ? item.label : undefined}
                    >
                        <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
                        <span className={`transition-all duration-300 overflow-hidden ${expanded ? 'opacity-100 max-w-40' : 'opacity-0 max-w-0'}`}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className={`border-t border-[#E1E7DF] transition-all duration-300 ${expanded ? 'p-3' : 'p-2 flex justify-center'}`}>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 rounded-[10px] text-sm font-inter transition-all duration-150 w-full ${
                        expanded
                            ? "px-4 py-2.5 text-[#4F6354] hover:text-[#D04A3A] hover:bg-[#FFD9D2]"
                            : "p-2.5 justify-center text-[#4F6354] hover:text-[#D04A3A] hover:bg-[#FFD9D2]"
                    }`}
                    title={!expanded ? "Cerrar sesión" : undefined}
                >
                    <LogoutIcon className="w-5 h-5" />
                    <span className={`transition-all duration-300 overflow-hidden ${expanded ? 'opacity-100 max-w-40' : 'opacity-0 max-w-0'}`}>Cerrar sesión</span>
                </button>
            </div>
        </div>
    );
}

export function MainLayout() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const loadAppData = useGlobalStore(state => state.loadAppData);
    const fetchPermissions = useAuthStore(state => state.fetchPermissions);

    // Rehydrate permissions + plan + global app data (breeds, animals, stables, …)
    // from the backend on mount so everything survives a page refresh — the auth
    // store resets on reload while the token persists in localStorage, and
    // loadAppData otherwise only runs at login. Staff get the OWNER's plan from the
    // fetchCurrentPlan runs only for owners.
    useEffect(() => {
        (async () => {
            await fetchPermissions();
            loadAppData();
            })();
    }, [fetchPermissions, loadAppData]);

    return (
        <div className="min-h-screen bg-[#D8E8DD]">
            <div className="fixed top-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[#C8F0DA]/30 blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#B8E4CB]/25 blur-[80px] pointer-events-none" />

            <aside className="hidden lg:flex fixed left-0 top-0 h-screen flex-col bg-white shadow-lg z-30">
                <SidebarContent
                    expanded={sidebarExpanded}
                    onToggle={() => setSidebarExpanded(!sidebarExpanded)}
                    onNavigate={() => {}}
                />
            </aside>

            <IconButton
                onClick={() => setDrawerOpen(true)}
                className="!fixed !top-4 !left-4 !z-40 !bg-white !shadow-md hover:!shadow-lg lg:!hidden !text-[#4F6354]"
            >
                <MenuIcon />
            </IconButton>

            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                className="lg:hidden"
                PaperProps={{
                    sx: {
                        border: "none",
                        boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
                    }
                }}
            >
                <SidebarContent expanded={true} onToggle={() => setDrawerOpen(false)} onNavigate={() => setDrawerOpen(false)} />
            </Drawer>

            <main className={`p-6 min-h-screen transition-all duration-300 ${sidebarExpanded ? 'lg:ml-[280px]' : 'lg:ml-[68px]'}`}>
                <Outlet />
            </main>

            <AlertToaster />
        </div>
    );
}
