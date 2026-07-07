export type WishlistProductSnapshot = {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  minPrice: number;
  addedAt: string;
};

export type WishlistTopProduct = {
  productId: string;
  productName: string;
  productSlug: string;
  wishlistCount: number;
};

export type WishlistAdminInsights = {
  totalItems: number;
  uniqueCustomers: number;
  topProducts: WishlistTopProduct[];
};
