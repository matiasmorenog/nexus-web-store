export type StoreStaffMember = {
  id: string;
  email: string;
  name: string | null;
  role: "STORE_STAFF";
  joinedAt: string;
};

export type InviteStoreStaffInput = {
  email: string;
  name: string;
  password: string;
};
