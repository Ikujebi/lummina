// permissions.ts
import { Role } from "@prisma/client"; // Prisma enum

// ----------------------------
// Define allowed actions per role
// ----------------------------
export const rolePermissions = {
  [Role.ADMIN]: {
    canAccessAllMatters: true,
    canManageUsers: true,
    canManageDocuments: true,
    canManageAppointments: true,
    canViewAuditLogs: true,
  },
  [Role.LAWYER]: {
    canAccessAllMatters: false, // only assigned matters
    canManageDocuments: true,
    canManageAppointments: true,
    canViewAuditLogs: false,
  },
  [Role.CLIENT]: {
    canAccessAllMatters: false, // only their matters
    canManageDocuments: false,
    canManageAppointments: true,
    canViewAuditLogs: false,
  },
};

// ----------------------------
// Helper functions
// ----------------------------

export function canAccessMatter(userRole: Role, isOwner: boolean) {
  if (userRole === Role.ADMIN) return true;
  if (userRole === Role.LAWYER && isOwner) return true;
  if (userRole === Role.CLIENT && isOwner) return true;
  return false;
}

export function canManageDocument(userRole: Role, isOwner: boolean) {
  if (userRole === Role.ADMIN) return true;
  if (userRole === Role.LAWYER && isOwner) return true;
  return false;
}

export function canManageAppointments(userRole: Role) {
  return rolePermissions[userRole].canManageAppointments;
}

export function canViewAuditLogs(userRole: Role) {
  return rolePermissions[userRole].canViewAuditLogs;
}

// Example usage in API routes:
// if (!canAccessMatter(user.role, userOwnsMatter)) {
//    return res.status(403).json({ error: "Unauthorized" });
// }