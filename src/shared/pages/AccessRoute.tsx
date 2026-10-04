import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../auth/store/auth-store";
import { canManageStaff } from "../utils/access-control";

interface AccessRouteProps {
    permission: "manageStaff";
}

// Guards routes behind a backend-resolved permission. Waits until permissions
// are loaded from /user/profile so a refresh does not bounce an allowed user.
export function AccessRoute({ permission }: AccessRouteProps) {
    const user = useAuthStore(state => state.user);
    const permissionsLoaded = useAuthStore(state => state.permissionsLoaded);

    if (!permissionsLoaded) return null;

    const allowed = permission === "manageStaff" ? canManageStaff(user) : false;

    return allowed ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
