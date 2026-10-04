import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { User } from "../model/user";
import { authService } from "../services/auth-service";
import { useGlobalStore } from "../../shared/stores/global-store";

type ApiError = {
    response?: {
        data?: unknown;
    };
};

function loadUser(): User {
    try {
        const raw = localStorage.getItem("user");
        if (raw) return new User(JSON.parse(raw));
    } catch { /* ignore */ }
    return new User();
}

function saveUser(user: User) {
    localStorage.setItem("user", JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        isStaff: user.isStaff,
        effectiveUserId: user.effectiveUserId,
        accessLevel: user.accessLevel,
        canRead: user.canRead,
        canEdit: user.canEdit,
        canManageStaff: user.canManageStaff,
    }));
}

function clearUser() {
    localStorage.removeItem("user");
}

// Pulls the most useful message out of an axios error. Prefers the message the
// API sent back ({ message } or a plain string body); falls back to a friendly
// default so the user never sees a raw "Network Error".
function extractApiErrorMessage(error: unknown, fallback: string): string {
    const data = (error as ApiError)?.response?.data;
    if (data) {
        if (typeof data === "string" && data.trim()) return data;
        if (
            typeof data === "object" &&
            "message" in data &&
            typeof data.message === "string" &&
            data.message.trim()
        ) return data.message;
    }
    return fallback;
}

interface AuthState {
    user: User;
    error: string | null;
    isLoading: boolean;
    planLoaded: boolean;
    permissionsLoaded: boolean;
    setUser: (user: Partial<User>) => void;
    setError: (error: string | null) => void;
    logout: () => void;

    login: () => Promise<boolean>;
    register: (confirmPassword: string) => Promise<boolean>;

    /**
     * Loads the real permissions (isStaff, accessLevel, canEdit, ...) from the
     * backend profile. The values are never invented locally so access changes
     * apply on the next load even with an old token.
     */
    fetchPermissions: () => Promise<void>;

    setSubscription: (plan: string) => void;
}

export const useAuthStore = create(immer<AuthState>((set, get) => ({
    user: loadUser(),
    error: null,
    isLoading: false,
    planLoaded: false,
    permissionsLoaded: false,
    setUser: (user: Partial<User>) => set(state => { state.user = { ...state.user, ...user }; }),
    setError: (error: string | null) => set(state => { state.error = error; }),
    logout: () => {
        localStorage.removeItem("token");
        clearUser();
        set(state => {
            state.user = new User();
            state.error = null;
            state.isLoading = false;
            state.planLoaded = false;
            state.permissionsLoaded = false;
        });
    },
    login: async () => {
        set(state => { state.isLoading = true; });
        try {
            const { user } = get();
            const res = await authService.login(user);
            if (res.data.token) localStorage.setItem("token", res.data.token);
            saveUser(user);
            await get().fetchPermissions();
            await useGlobalStore.getState().loadAppData();
            return true;
        } catch (error: unknown) {
            console.error("Login failed:", error);
            set(state => {
                state.error = extractApiErrorMessage(
                    error, "No se pudo iniciar sesión. Verifica tus credenciales e inténtalo de nuevo.");
            });
            return false;
        } finally {
            set(state => { state.isLoading = false; });
        }
    },
    register: async (confirmPassword) => {
        const { user } = get();
        if (user.password !== confirmPassword) {
            set(state => { state.error = "Las contraseñas no coinciden"; });
            return false;
        }
        set(state => { state.isLoading = true; });
        try {
            const res = await authService.register(user);
            if (res.data.token) localStorage.setItem("token", res.data.token);
            saveUser(user);
            await get().fetchPermissions();
            await useGlobalStore.getState().loadAppData();
            return true;
        } catch (error: unknown) {
            console.error("Registration failed:", error);
            set(state => {
                state.error = extractApiErrorMessage(
                    error, "No se pudo registrar el usuario. Inténtalo de nuevo.");
            });
            return false;
        } finally {
            set(state => { state.isLoading = false; });
        }
    },
    fetchPermissions: async () => {
        try {
            const res = await authService.getProfile();
            const profile = res.data;
            set(state => {
                state.user = {
                    ...state.user,
                    id: profile.id,
                    username: profile.name ?? state.user.username,
                    email: profile.email ?? state.user.email,
                    isStaff: profile.isStaff,
                    effectiveUserId: profile.effectiveUserId,
                    accessLevel: profile.accessLevel,
                    canRead: profile.canRead,
                    canEdit: profile.canEdit,
                    canManageStaff: profile.canManageStaff,
                };
                state.permissionsLoaded = true;
                // For staff the backend reports the OWNER's plan, so Plus features
                // stay unlocked when the rancher is Plus. PlusRoute relies on this.
                if (profile.isStaff) state.planLoaded = true;
            });
            saveUser(get().user);
        } catch (error: unknown) {
            console.error("Failed to load permissions:", error);
            // Most restrictive defaults (e.g. inactive staff gets 403 here):
            // nothing is editable and gated pages stay locked.
            set(state => {
                state.user = {
                    ...state.user,
                    isStaff: true,
                    canRead: false,
                    canEdit: false,
                    canManageStaff: false,
                };
                state.permissionsLoaded = true;
                state.error = extractApiErrorMessage(
                    error, "No se pudieron cargar los permisos.");
            });
        }
    },
    setSubscription: (plan: string) =>
        set(state => {
            // Reassign a new object (not in-place) so immer emits a new reference:
            // User is a class instance, which immer does not draft, so an in-place
            // mutation would not notify subscribers until a remount.
            state.planLoaded = true;
        }),
})));
