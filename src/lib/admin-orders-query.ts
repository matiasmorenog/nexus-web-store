import { cache } from "react";
import type { AdminOrderCardData } from "@/components/admin/admin-order-card";
import { db } from "@/lib/db";
import {
  ADMIN_ORDERS_PAGE_SIZE,
  adminOrdersListSkip,
} from "@/lib/admin-pagination";
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/order-status";
import { getOrderPaymentInfo } from "@/lib/order-payment";
import { getOrderShippingInfo } from "@/lib/order-shipping";
import { Prisma } from "@prisma/client";

export type AdminOrdersFilterParams = {
  estado?: string;
  q?: string;
  desde?: string;
  hasta?: string;
  /** Sin filtro de fecha (todos los pedidos). */
  showAll?: boolean;
};

export type AdminOrdersUrlParams = AdminOrdersFilterParams & {
  todos?: string;
};

function isoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayIsoDateLocal() {
  return isoDateLocal(new Date());
}

export function isAdminOrdersTodayRange(desde?: string, hasta?: string) {
  const today = getTodayIsoDateLocal();
  const end = hasta ?? desde;
  return desde === today && end === today;
}

export function getDefaultAdminOrdersDateRange() {
  const today = getTodayIsoDateLocal();

  return {
    desde: today,
    hasta: today,
  };
}

export function needsAdminOrdersDefaultRangeRedirect(
  params: AdminOrdersUrlParams,
) {
  return params.todos !== "1" && !params.desde && !params.hasta;
}

export function buildAdminOrdersRedirectSearchParams(
  params: AdminOrdersUrlParams,
) {
  const searchParams = new URLSearchParams();
  const range = getDefaultAdminOrdersDateRange();

  if (params.estado) searchParams.set("estado", params.estado);
  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  searchParams.set("desde", range.desde);
  searchParams.set("hasta", range.hasta);

  return searchParams;
}

export function resolveAdminOrdersFilters(
  params: AdminOrdersUrlParams,
): AdminOrdersFilterParams {
  if (params.todos === "1" || params.showAll) {
    return {
      estado: params.estado,
      q: params.q,
      showAll: true,
    };
  }

  if (params.desde || params.hasta) {
    return {
      estado: params.estado,
      q: params.q,
      desde: params.desde,
      hasta: params.hasta,
    };
  }

  const range = getDefaultAdminOrdersDateRange();
  return {
    estado: params.estado,
    q: params.q,
    desde: range.desde,
    hasta: range.hasta,
  };
}

export function parseAdminOrdersUrlParams(
  searchParams: URLSearchParams,
): AdminOrdersUrlParams {
  return {
    estado: searchParams.get("estado") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    desde: searchParams.get("desde") ?? undefined,
    hasta: searchParams.get("hasta") ?? undefined,
    todos: searchParams.get("todos") ?? undefined,
  };
}

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

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseOrderDateFilter(value?: string): Date | undefined {
  if (!value?.trim() || !ISO_DATE_RE.test(value)) return undefined;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;

  return date;
}

function endOfOrderDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

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

  const desde = parseOrderDateFilter(params.desde);
  const hasta = parseOrderDateFilter(params.hasta ?? params.desde);

  if (desde || hasta) {
    where.createdAt = {
      ...(desde ? { gte: desde } : {}),
      ...(hasta ? { lte: endOfOrderDay(hasta) } : {}),
    };
  }

  return where;
}

export function mapAdminOrderRow(order: OrderWithRelations): AdminOrderCardData {
  const payment = getOrderPaymentInfo({
    status: order.status,
    mpPaymentId: order.mpPaymentId,
    mpPreferenceId: order.mpPreferenceId,
  });

  const shipping = getOrderShippingInfo({
    isPickup: order.isPickup,
    meShipmentId: order.meShipmentId,
    meTrackingNumber: order.meTrackingNumber,
    meTrackingUrl: order.meTrackingUrl,
    meCarrier: order.meCarrier,
    meStatus: order.meStatus,
    meEstimatedDelivery: order.meEstimatedDelivery,
    status: order.status,
  });

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
    payment,
    shipping,
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

export const getAdminOrdersPage = cache(
  async (storeId: string, page = 1, params: AdminOrdersFilterParams = {}) => {
    const where = buildAdminOrdersWhere(storeId, params);

    const [orders, total] = await db.$transaction([
      db.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip: adminOrdersListSkip(page),
        take: ADMIN_ORDERS_PAGE_SIZE,
      }),
      db.order.count({ where }),
    ]);

    const rows = orders.map(mapAdminOrderRow);

    return {
      orders: rows,
      total,
      page,
      hasMore: adminOrdersListSkip(page) + rows.length < total,
    };
  },
);

export const getAdminOrdersSummary = cache(
  async (storeId: string, params: AdminOrdersFilterParams = {}) => {
    const facetWhere = buildAdminOrdersWhere(storeId, {
      ...params,
      estado: undefined,
    });

    const [storeTotalOrders, totalOrders, statusGroups, revenue] =
      await db.$transaction([
        db.order.count({ where: { storeId } }),
        db.order.count({ where: facetWhere }),
        db.order.groupBy({
          by: ["status"],
          where: facetWhere,
          orderBy: { status: "asc" },
          _count: { _all: true },
        }),
        db.order.aggregate({
          where: {
            ...facetWhere,
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
        counts[group.status as OrderStatus] =
          typeof group._count === "object" ? (group._count._all ?? 0) : 0;
      }
    }

    return {
      storeTotalOrders,
      totalOrders,
      counts,
      paidRevenue: Number(revenue._sum.total ?? 0),
    };
  },
);

/** Una sola transacción para la página (Neon pooler suele tener connection_limit=1). */
export const getAdminOrdersPageData = cache(
  async (storeId: string, params: AdminOrdersFilterParams = {}) => {
    const facetWhere = buildAdminOrdersWhere(storeId, {
      ...params,
      estado: undefined,
    });
    const where = buildAdminOrdersWhere(storeId, params);

    const [
      storeTotalOrders,
      totalOrders,
      statusGroups,
      revenue,
      orders,
      pageTotal,
    ] = await db.$transaction([
      db.order.count({ where: { storeId } }),
      db.order.count({ where: facetWhere }),
      db.order.groupBy({
        by: ["status"],
        where: facetWhere,
        orderBy: { status: "asc" },
        _count: { _all: true },
      }),
      db.order.aggregate({
        where: {
          ...facetWhere,
          status: { in: ["PAID", "SHIPPED"] },
        },
        _sum: { total: true },
      }),
      db.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip: adminOrdersListSkip(1),
        take: ADMIN_ORDERS_PAGE_SIZE,
      }),
      db.order.count({ where }),
    ]);

    const counts = Object.fromEntries(
      ORDER_STATUSES.map((status) => [status, 0]),
    ) as Record<OrderStatus, number>;

    for (const group of statusGroups) {
      if (group.status in counts) {
        counts[group.status as OrderStatus] =
          typeof group._count === "object" ? (group._count._all ?? 0) : 0;
      }
    }

    const rows = orders.map(mapAdminOrderRow);

    return {
      summary: {
        storeTotalOrders,
        totalOrders,
        counts,
        paidRevenue: Number(revenue._sum.total ?? 0),
      },
      page: {
        orders: rows,
        total: pageTotal,
        page: 1,
        hasMore: adminOrdersListSkip(1) + rows.length < pageTotal,
      },
    };
  },
);

export function adminOrdersFilterKey(params: AdminOrdersFilterParams) {
  return [
    params.estado ?? "",
    params.q?.trim() ?? "",
    params.showAll ? "all" : "",
    params.desde ?? "",
    params.hasta ?? "",
  ].join("|");
}

export function formatAdminOrdersDateFilterLabel(
  desde?: string,
  hasta?: string,
): string | null {
  if (!desde) return null;

  if (isAdminOrdersTodayRange(desde, hasta)) {
    return "Hoy";
  }

  const format = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: hasta && hasta !== desde ? "numeric" : undefined,
    });

  if (!hasta || hasta === desde) {
    return format(desde);
  }

  return `${format(desde)} – ${format(hasta)}`;
}
