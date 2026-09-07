import { useState } from "react";
import {
  canViewPage,
  demoRoles,
  demoUsers,
  effectivePermissions,
  hasPermission,
  hasRecordPermission,
  type Permission,
  type Role,
} from "./model";
export function useAccess() {
  const [users, setUsers] = useState(demoUsers);
  const [roles, setRoles] = useState(demoRoles);
  const [userId, setUserId] = useState(demoUsers[0].id);
  const user = users.find((u) => u.id === userId)!;
  const can = (p: Permission) => hasPermission(user, roles, p);
  const canRecord = (base: string, ownerId?: string) =>
    hasRecordPermission(user, roles, base, ownerId);
  const canPage = (page: string) => canViewPage(user, roles, page);
  function createRole(name: string) {
    if (
      !can("roles.create") ||
      !name.trim() ||
      roles.some((r) => r.name.toLowerCase() === name.trim().toLowerCase())
    )
      return false;
    setRoles((old) => [
      ...old,
      {
        id: `role-${Date.now()}`,
        name: name.trim(),
        description: "Custom permission role",
        permissions: [],
      },
    ]);
    return true;
  }
  function setGrant(roleId: string, key: Permission, enabled: boolean) {
    if (!can("roles.permissions.edit")) return;
    setRoles((old) =>
      old.map((r) =>
        r.id === roleId && !r.system
          ? {
              ...r,
              permissions: enabled
                ? [...new Set([...r.permissions, key])]
                : r.permissions.filter((p) => p !== key),
            }
          : r,
      ),
    );
  }
  function assignRole(targetId: string, roleId: string, enabled: boolean) {
    if (!can("users.roles.assign") || !roles.some((r) => r.id === roleId))
      return;
    setUsers((old) =>
      old.map((u) =>
        u.id === targetId &&
        !(u.id === "user-super-admin" && roleId === "super-admin")
          ? {
              ...u,
              roleIds: enabled
                ? [...new Set([...u.roleIds, roleId])]
                : u.roleIds.filter((r) => r !== roleId),
            }
          : u,
      ),
    );
  }
  return {
    users,
    roles,
    user,
    userId,
    switchUser: (id: string) => {
      if (users.some((u) => u.id === id)) setUserId(id);
    },
    can,
    canRecord,
    canPage,
    grants: effectivePermissions(user, roles),
    createRole,
    setGrant,
    assignRole,
  };
}
export type Access = ReturnType<typeof useAccess>;
