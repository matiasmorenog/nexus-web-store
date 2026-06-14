import type { AdminOrderCardData } from "@/components/admin/admin-order-card";
import { db } from "@/lib/db";
import { ADMIN_LIST_PAGE_SIZE, adminListSkip } from "@/lib/admin-pagination";
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/order-status";
import { Prisma } from "@prisma/client";

export type AdminOrdersFilterParams = {
  estado?: string;
  q?: string;
};

const orderInclude = {
  items: {
    include: {
      variant: { include: { product: true } },
    },
  },
} as const;

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

export function buildAdminOrdersWhere(
  storeId: string,
  params: AdminOrdersFilterParams,
): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = { storeId };

  if (params.estado && ORDER_STATUSES.includes(params.estado as OrderStatus)) {
    where.status = params.estado as OrderStatus;
  }

  const query = params.q?.trim();
  if (query) {
    where.OR = [
      { customerName: { contains: query, mode: "insensitive" } },
      { customerEmail: { contains: query, mode: "insensitive" } },
      { customerPhone: { contains: query, mode: "insensitive" } },
      { id: { contains: query, mode: "insensitive" } },
    ];
  }

  return where;
}

export function mapAdminOrderRow(order: OrderWithRelations): AdminOrderCardData {
  return {
    id: order.id,
    status: order.status,
    total: Number(order.total),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    isPickup: order.isPickup,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingZip: order.shippingZip,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      variant: {
        size: item.variant.size,
        color: item.variant.color,
        product: { name: item.variant.product.name },
      },
    })),
  };
}

export async function getAdminOrdersPage(
  storeId: string,
  page = 1,
  params: AdminOrdersFilterParams = {},
) {
  const where = buildAdminOrdersWhere(storeId, params);

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip: adminListSkip(page),
      take: ADMIN_LIST_PAGE_SIZE,
    }),
    db.order.count({ where }),
  ]);

  const rows = orders.map(mapAdminOrderRow);

  return {
    orders: rows,
    total,
    page,
    hasMore: adminListSkip(page) + rows.length < total,
  };
}

export async function getAdminOrdersSummary(storeId: string) {
  const [totalOrders, statusGroups, revenue] = await Promise.all([
    db.order.count({ where: { storeId } }),
    db.order.groupBy({
      by: ["status"],
      where: { storeId },
      _count: { _all: true },
    }),
    db.order.aggregate({
      where: {
        storeId,
        status: { in: ["PAID", "SHIPPED"] },
      },
      _sum: { total: true },
    }),
  ]);

  const counts = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0]),
  ) as Record<OrderStatus, number>;

  for (const group of statusGroups) {
    if (group.status in counts) {
      counts[group.status as OrderStatus] = group._count._all;
    }
  }

  return {
    totalOrders,
    counts,
    paidRevenue: Number(revenue._sum.total ?? 0),
  };
}

export function adminOrdersFilterKey(params: AdminOrdersFilterParams) {
  return `${params.estado ?? ""}|${params.q?.trim() ?? ""}`;
}
