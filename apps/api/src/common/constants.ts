export const ROLES = ["dev", "qa", "admin", "pm"] as const;
export type Role = (typeof ROLES)[number];

export const EDITABLE_ROLES = ["dev", "qa", "pm"] as const;
export type EditableRole = (typeof EDITABLE_ROLES)[number];

export const LEVELS = ["l1", "l2", "l3"] as const;
export type Level = (typeof LEVELS)[number];

export const ROLE_LEVELS: Record<EditableRole, readonly Level[]> = {
  dev: ["l1", "l2", "l3"],
  qa: ["l1", "l2", "l3"],
  pm: ["l1", "l2", "l3"]
};

export const EDITABLE_ROLE_LEVELS = EDITABLE_ROLES.flatMap((role) =>
  ROLE_LEVELS[role].map((level) => ({ role, level }))
);

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function isEditableRole(value: string): value is EditableRole {
  return (EDITABLE_ROLES as readonly string[]).includes(value);
}

export function isLevel(value: string): value is Level {
  return (LEVELS as readonly string[]).includes(value);
}

export function isValidRoleLevel(role: string, level: string): boolean {
  if (!isEditableRole(role) || !isLevel(level)) return false;
  return ROLE_LEVELS[role].includes(level);
}
