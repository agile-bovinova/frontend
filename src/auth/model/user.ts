export class User {
    id?: number;
    username?: string;
    email?: string;
    password?: string;

    // Access control resolved by the backend (/user/profile). Never invented locally.
    isStaff?: boolean;
    effectiveUserId?: number;
    accessLevel?: "Owner" | "ReadOnly" | "Editor" | "Manager";
    canRead?: boolean;
    canEdit?: boolean;
    canManageStaff?: boolean;

    constructor(data: Partial<User> = {}) {
        Object.assign(this, data);
    }
}
