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

export type CrmListSort = "lastOrder" | "totalSpent" | "orderCount";

export type CrmListFilters = {
  q?: string;
  tag?: string;
  inactiveDays?: number;
  sort?: CrmListSort;
};

export type CrmStoreStats = {
  customerCount: number;
  averageLtv: number;
  repurchaseRate: number;
  inactive30Count: number;
};

export type CrmSegmentFilters = {
  q?: string;
  tag?: string;
  inactiveDays?: number;
  sort?: CrmListSort;
};

export type CrmSegment = {
  id: string;
  name: string;
  filters: CrmSegmentFilters;
  createdAt: string;
  updatedAt: string;
};

export type CrmSegmentInput = {
  name: string;
  filters: CrmSegmentFilters;
};
