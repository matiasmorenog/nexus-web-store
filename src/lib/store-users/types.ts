import type { StoreStaffRole } from "@prisma/client";

export type StoreStaffMember = {
  id: string;
  email: string;
  name: string | null;
  staffRole: StoreStaffRole;
  joinedAt: string;
};

export type InviteStoreStaffInput = {
  email: string;
  name: string;
  password: string;
  staffRole: StoreStaffRole;
};

export type UpdateStoreStaffRoleInput = {
  staffRole: StoreStaffRole;
};
