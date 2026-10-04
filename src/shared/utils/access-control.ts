import type { User } from "../../auth/model/user";

// Single source of truth for permission checks in the UI. The values come from
// the backend profile response (auth store); do not duplicate rules per component.

export function isOwner(user?: User | null) {
    return !user?.isStaff;
}

export function canRead(user?: User | null) {
    return Boolean(user?.canRead);
}

export function canEdit(user?: User | null) {
    return Boolean(user?.canEdit);
}

export function canManageStaff(user?: User | null) {
    return Boolean(user?.canManageStaff);
}

