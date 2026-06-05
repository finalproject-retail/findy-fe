export const ADMIN_ROLE = "ROLE_ADMIN";

export function isAdminRole(role?: string | null): boolean {
  return role?.trim() === ADMIN_ROLE;
}
