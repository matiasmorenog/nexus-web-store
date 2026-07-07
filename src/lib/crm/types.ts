export type CrmCustomerListItem = {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  tags: string[];
};

export type CrmCustomerProfile = {
  email: string;
  tags: string[];
  notes: string;
  updatedAt: string | null;
};

export type CrmCustomerOrder = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
};

export type CrmCustomerDetail = {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  firstOrderAt: string | null;
  profile: CrmCustomerProfile;
  orders: CrmCustomerOrder[];
};

export type CrmCustomerProfileInput = {
  tags: string[];
  notes: string;
};
