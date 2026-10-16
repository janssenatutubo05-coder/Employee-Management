import { usePage } from '@inertiajs/react';

/**
 * Role / permission helpers for conditional rendering.
 * The data comes from HandleInertiaRequests (Spatie roles + permissions).
 */
export function useAuth() {
    const user = usePage().props.auth.user;

    return {
        user,
        can: (permission) => user?.permissions?.includes(permission) ?? false,
        hasRole: (role) => user?.roles?.includes(role) ?? false,
    };
}
