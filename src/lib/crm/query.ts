import { cache } from "react";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  isValidCustomerEmail,
  normalizeCustomerEmail,
} from "@/lib/crm/format";
import type {
  CrmCustomerDetail,
  CrmCustomerListItem,
  CrmCustomerProfile,
} from "@/lib/crm/types";
import { getOrderStatusLabel } from "@/lib/order-status";

export type CrmCustomersListParams = {
  q?: string;
  limit?: number;
};

function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  if (value == null) return 0;
  return Number(value.toString());
}

function emptyProfile(email: string): CrmCustomerProfile {
  return {
    email,
    tags: [],
    notes: "",
    updatedAt: null,
  };
}

async function fetchCustomerProfiles(
  storeId: string,
  emails: string[],
): Promise<Map<string, CrmCustomerProfile>> {
  if (emails.length === 0) {
    return new Map();
  }

  const profiles = await db.storeCustomer.findMany({
    where: {
      storeId,
      email: { in: emails },
    },
  });

  return new Map(
    profiles.map((profile) => [
      profile.email,
      {
        email: profile.email,
        tags: profile.tags,
        notes: profile.notes,
        updatedAt: profile.updatedAt.toISOString(),
      },
    ]),
  );
}

function buildOrderSearchWhere(
  storeId: string,
  q?: string,
): Prisma.OrderWhereInput {
  const trimmed = q?.trim();
  if (!trimmed) {
    return { storeId };
  }

  return {
    storeId,
    OR: [
      { customerEmail: { contains: trimmed, mode: "insensitive" } },
      { customerName: { contains: trimmed, mode: "insensitive" } },
      { customerPhone: { contains: trimmed, mode: "insensitive" } },
    ],
  };
}

export async function listCrmCustomers(
  storeId: string,
  params: CrmCustomersListParams = {},
): Promise<CrmCustomerListItem[]> {
  const limit = Math.min(Math.max(params.limit ?? 100, 1), 200);

  const groups = await db.order.groupBy({
    by: ["customerEmail"],
    where: buildOrderSearchWhere(storeId, params.q),
    _count: { _all: true },
    _sum: { total: true },
    _max: {
      createdAt: true,
      customerName: true,
      customerPhone: true,
    },
    orderBy: {
      _max: {
        createdAt: "desc",
      },
    },
    take: limit,
  });

  const emails = groups.map((group) =>
    normalizeCustomerEmail(group.customerEmail),
  );
  const profileMap = await fetchCustomerProfiles(storeId, emails);

  return groups.map((group) => {
    const email = normalizeCustomerEmail(group.customerEmail);
    const profile = profileMap.get(email) ?? emptyProfile(email);

    return {
      email,
      name: group._max.customerName?.trim() || "Sin nombre",
      phone: group._max.customerPhone?.trim() || "—",
      orderCount: group._count._all,
      totalSpent: decimalToNumber(group._sum.total),
      lastOrderAt: group._max.createdAt?.toISOString() ?? new Date(0).toISOString(),
      tags: profile.tags,
    };
  });
}

export const getCrmCustomerDetail = cache(
  async (storeId: string, rawEmail: string): Promise<CrmCustomerDetail | null> => {
    const email = normalizeCustomerEmail(rawEmail);
    if (!isValidCustomerEmail(email)) {
      return null;
    }

    const orders = await db.order.findMany({
      where: {
        storeId,
        customerEmail: { equals: email, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        customerName: true,
        customerPhone: true,
      },
    });

    if (orders.length === 0) {
      return null;
    }

    const profileMap = await fetchCustomerProfiles(storeId, [email]);
    const profile = profileMap.get(email) ?? emptyProfile(email);

    const totalSpent = orders.reduce(
      (sum, order) => sum + decimalToNumber(order.total),
      0,
    );

    const latest = orders[0];
    const oldest = orders[orders.length - 1];

    return {
      email,
      name: latest.customerName.trim() || "Sin nombre",
      phone: latest.customerPhone.trim() || "—",
      orderCount: orders.length,
      totalSpent,
      lastOrderAt: latest.createdAt.toISOString(),
      firstOrderAt: oldest.createdAt.toISOString(),
      profile,
      orders: orders.map((order) => ({
        id: order.id,
        status: getOrderStatusLabel(order.status),
        total: decimalToNumber(order.total),
        createdAt: order.createdAt.toISOString(),
      })),
    };
  },
);
